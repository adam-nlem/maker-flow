<?php

namespace App\Service\Prelaunch;

use App\DTO\Response\Prelaunch\PrelaunchStatusResponseDTO;
use App\Entity\Enum\OtpType;
use App\Entity\Enum\PrelaunchRewardTier;
use App\Entity\Otp;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Mailing\MailingService;
use App\Service\Otp\OtpService;
use App\Service\Prelaunch\Exception\RateLimitExceededException;
use App\Service\Prelaunch\Exception\SubscriberNotFoundException;
use App\Service\RedisStore\RedisStoreService;

final class PrelaunchService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly OtpService $otpService,
        private readonly MailingService $mailingService,
        private readonly RedisStoreService $redisStore,
        private readonly bool $prelaunchEnabled,
    ) {}

    /**
     * @throws RateLimitExceededException
     */
    public function authenticate(string $email, string $ipAddress, ?string $referralCode): Otp
    {
        $existing = $this->userRepository->getByEmail($email);

        // Existing verified user → send OTP (acts as login)
        if ($existing !== null && $existing->isVerified()) {
            return $this->otpService->createAndSend($existing, OtpType::PrelaunchVerification);
        }

        // Rate-limit new registrations only
        if ($this->userRepository->countByIpAddress($ipAddress) >= 2) {
            throw new RateLimitExceededException();
        }

        // Existing unverified prelaunch subscriber → delete and recreate
        if ($existing !== null) {
            $this->userRepository->remove($existing, true);
        }

        // New user → create partial User
        $user = new User();
        $user->setEmail($email)
            ->setReferralCode($this->generateUniqueReferralCode())
            ->setIpAddress($ipAddress);

        if ($referralCode !== null) {
            $referrer = $this->userRepository->getByReferralCode($referralCode);
            if ($referrer !== null && $referrer->isVerified()) {
                $user->setReferredBy($referrer);
            }
        }

        $this->userRepository->save($user, true);

        return $this->otpService->createAndSend($user, OtpType::PrelaunchVerification);
    }

    /**
     * @throws SubscriberNotFoundException
     */
    public function getStatus(string $referralCode): PrelaunchStatusResponseDTO
    {
        $user = $this->userRepository->getByReferralCode($referralCode);

        if ($user === null || !$user->isVerified()) {
            throw new SubscriberNotFoundException();
        }

        $referralCount = $this->userRepository->countVerifiedReferrals($user);

        $unlockedTiers = [];
        $nextTier = null;
        $referralsNeeded = null;

        foreach (PrelaunchRewardTier::cases() as $tier) {
            if ($referralCount >= $tier->getThreshold()) {
                $unlockedTiers[] = $tier->value;
            } elseif ($nextTier === null) {
                $nextTier = $tier->value;
                $referralsNeeded = $tier->getThreshold() - $referralCount;
            }
        }

        return new PrelaunchStatusResponseDTO(
            $user->getEmail(),
            $user->getReferralCode(),
            $referralCount,
            $unlockedTiers,
            $nextTier,
            $referralsNeeded,
        );
    }

    public function syncReferrerSegments(User $referrer): void
    {
        $referralCount = $this->userRepository->countVerifiedReferrals($referrer);

        $tiersToSync = [];

        foreach (PrelaunchRewardTier::cases() as $tier) {
            if ($referralCount < $tier->getThreshold()) {
                continue;
            }

            $syncKey = RedisStoreService::getResendSyncedTierKey($referrer->getUuid(), $tier->value);

            if ($this->redisStore->exists($syncKey)) {
                continue;
            }

            $tiersToSync[] = $tier;
        }

        if (empty($tiersToSync)) {
            return;
        }

        $this->mailingService->ensureContactExists($referrer->getEmail(), $referrer->getFirstName());

        foreach ($tiersToSync as $tier) {
            $segmentId = $this->mailingService->findOrCreateSegment($tier->getSegmentName());
            $this->mailingService->addContactToSegment($segmentId, $referrer->getEmail());

            $syncKey = RedisStoreService::getResendSyncedTierKey($referrer->getUuid(), $tier->value);
            $this->redisStore->set($syncKey, '1');
        }
    }

    public function isEnabled(): bool
    {
        return $this->prelaunchEnabled;
    }

    private function generateUniqueReferralCode(): string
    {
        do {
            $code = substr(bin2hex(random_bytes(6)), 0, 8);
        } while ($this->userRepository->getByReferralCode($code) !== null);

        return $code;
    }
}
