<?php

namespace App\Service\Otp;

use App\Entity\Enum\OtpType;
use App\Entity\Otp;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Message\SendEmailMessage;
use App\Repository\OtpRepository;
use App\Service\Mailing\Template\EmailVerificationOtpEmailTemplate;
use App\Service\Mailing\Template\LoginOtpEmailTemplate;
use App\Service\Mailing\Template\PrelaunchVerificationEmailTemplate;
use App\Service\Otp\Exception\ExpiredOtpException;
use App\Service\Otp\Exception\InvalidOtpException;
use App\Service\Otp\Exception\InvalidPendingTokenException;
use App\Service\Otp\Exception\MaxAttemptsOtpException;
use Symfony\Component\Messenger\MessageBusInterface;

final class OtpService
{
    private const MAX_ATTEMPTS = 5;
    private const EXPIRATION_MINUTES = 10;

    public function __construct(
        private readonly OtpRepository $otpRepository,
        private readonly MessageBusInterface $messageBus,
    ) {}

    public function createAndSend(User $user, OtpType $type): Otp
    {
        $this->otpRepository->invalidateAllForUser($user, $type);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $pendingOtpToken = $this->generateUniquePendingToken();

        $otp = new Otp();
        $otp->setCode($code)
            ->setType($type)
            ->setPendingOtpToken($pendingOtpToken)
            ->setExpiresAt(DateHelper::createUtcDateTimeImmutable()->modify('+' . self::EXPIRATION_MINUTES . ' minutes'))
            ->setUser($user);

        $this->otpRepository->save($otp, true);

        $template = match ($type) {
            OtpType::Login => new LoginOtpEmailTemplate(
                $user->getEmail(),
                $user->getFirstName(),
                $code,
            ),
            OtpType::EmailVerification => new EmailVerificationOtpEmailTemplate(
                $user->getEmail(),
                $user->getFirstName(),
                $code,
            ),
            OtpType::PrelaunchVerification => new PrelaunchVerificationEmailTemplate(
                $user->getEmail(),
                $code,
            ),
        };

        $this->messageBus->dispatch(new SendEmailMessage($template));

        return $otp;
    }

    private function generateUniquePendingToken(): string
    {
        do {
            $token = bin2hex(random_bytes(32));
        } while ($this->otpRepository->getByPendingOtpToken($token) !== null);

        return $token;
    }

    /**
     * @throws InvalidPendingTokenException
     * @throws MaxAttemptsOtpException
     * @throws ExpiredOtpException
     * @throws InvalidOtpException
     */
    public function verify(string $pendingOtpToken, string $code): Otp
    {
        $otp = $this->otpRepository->getByPendingOtpToken($pendingOtpToken);

        if ($otp === null || $otp->isUsed()) {
            throw new InvalidPendingTokenException();
        }

        if ($otp->getAttempts() >= self::MAX_ATTEMPTS) {
            throw new MaxAttemptsOtpException();
        }

        if ($otp->isExpired()) {
            throw new ExpiredOtpException();
        }

        if ($otp->getCode() !== $code) {
            $otp->incrementAttempts();
            $this->otpRepository->save($otp, true);

            throw new InvalidOtpException(self::MAX_ATTEMPTS - $otp->getAttempts());
        }

        $otp->setUsedAt(DateHelper::createUtcDateTimeImmutable());
        $this->otpRepository->save($otp, true);
        return $otp;
    }
}
