<?php

namespace App\Service\Mailing;

use App\Exception\Mailing\MailingRetryableException;
use App\Service\RedisStore\RedisStoreService;
use Resend\Client;
use Resend\Exceptions\ErrorException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\RateLimiter\RateLimiterFactory;

final class MailingService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly Client $resend,
        private readonly string $fromAddress,
        private readonly string $fromName,
        private readonly RateLimiterFactory $resendApiLimiter,
        private readonly RedisStoreService $redisStore,
    ) {}

    public function send(Email $email): void
    {
        if (count($email->getFrom()) === 0) {
            $email->from(new Address($this->fromAddress, $this->fromName));
        }

        $this->throttle();
        $this->mailer->send($email);
    }

    /**
     * @throws MailingRetryableException
     */
    public function findOrCreateSegment(string $name): string
    {
        $cacheKey = RedisStoreService::getResendSegmentKey($name);
        $cached = $this->redisStore->get($cacheKey);

        if ($cached !== null) {
            return $cached;
        }

        try {
            $this->throttle();
            $segments = $this->resend->segments->list();

            foreach ($segments['data'] as $segment) {
                $this->redisStore->set(RedisStoreService::getResendSegmentKey($segment['name']), $segment['id']);
            }

            $cached = $this->redisStore->get($cacheKey);

            if ($cached !== null) {
                return $cached;
            }

            $this->throttle();
            $created = $this->resend->segments->create(['name' => $name]);

            $this->redisStore->set($cacheKey, $created['id']);

            return $created['id'];
        } catch (ErrorException $e) {
            $this->throwIfRetryable($e);

            throw $e;
        }
    }

    /**
     * @throws MailingRetryableException
     */
    public function ensureContactExists(string $email, ?string $firstName = null): void
    {
        try {
            $params = ['email' => $email];

            if ($firstName !== null) {
                $params['first_name'] = $firstName;
            }

            $this->throttle();
            $this->resend->contacts->create($params);
        } catch (ErrorException $e) {
            $this->throwIfRetryable($e);

            throw $e;
        }
    }

    /**
     * @throws MailingRetryableException
     */
    public function addContactToSegment(string $segmentId, string $email): void
    {
        try {
            $this->throttle();
            $this->resend->contacts->segments->add(
                contact: $email,
                segmentId: $segmentId,
            );
        } catch (ErrorException $e) {
            $this->throwIfRetryable($e);

            throw $e;
        }
    }

    /**
     * @throws MailingRetryableException
     */
    private function throwIfRetryable(ErrorException $e): void
    {
        $retryableStatusCodes = [429, 500, 502, 503, 504];

        if (in_array($e->getErrorCode(), $retryableStatusCodes, true)) {
            throw new MailingRetryableException($e->getMessage(), $e->getErrorCode(), $e);
        }
    }

    private function throttle(): void
    {
        $this->resendApiLimiter->create('resend_api')->reserve()->wait();
    }
}
