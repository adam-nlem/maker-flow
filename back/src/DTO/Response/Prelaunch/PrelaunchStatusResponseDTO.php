<?php

namespace App\DTO\Response\Prelaunch;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class PrelaunchStatusResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_prelaunch_status'])]
        private readonly string $email,
        #[Groups(['api_prelaunch_status'])]
        private readonly string $referralCode,
        #[Groups(['api_prelaunch_status'])]
        private readonly int $referralCount,
        #[Groups(['api_prelaunch_status'])]
        private readonly array $unlockedTiers,
        #[Groups(['api_prelaunch_status'])]
        private readonly ?string $nextTier,
        #[Groups(['api_prelaunch_status'])]
        private readonly ?int $referralsNeeded,
    ) {}

    public function getData(): array
    {
        return [
            'email' => $this->getEmail(),
            'referralCode' => $this->getReferralCode(),
            'referralCount' => $this->getReferralCount(),
            'unlockedTiers' => $this->getUnlockedTiers(),
            'nextTier' => $this->getNextTier(),
            'referralsNeeded' => $this->getReferralsNeeded(),
        ];
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getReferralCode(): string
    {
        return $this->referralCode;
    }

    public function getReferralCount(): int
    {
        return $this->referralCount;
    }

    public function getUnlockedTiers(): array
    {
        return $this->unlockedTiers;
    }

    public function getNextTier(): ?string
    {
        return $this->nextTier;
    }

    public function getReferralsNeeded(): ?int
    {
        return $this->referralsNeeded;
    }
}
