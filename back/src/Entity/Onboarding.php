<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\OnboardingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: OnboardingRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Onboarding
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_onboarding_show', 'api_onboarding_complete_step', 'api_onboarding_dismiss'])]
    private ?string $uuid = null;

    #[ORM\OneToOne(inversedBy: 'onboarding')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['api_onboarding_show', 'api_onboarding_complete_step', 'api_onboarding_dismiss'])]
    private array $completedSteps = [];

    #[ORM\Column(nullable: true)]
    #[Groups(['api_onboarding_show', 'api_onboarding_complete_step', 'api_onboarding_dismiss'])]
    private ?\DateTimeImmutable $dismissedAt = null;

    #[ORM\Column]
    #[Groups(['api_onboarding_show', 'api_onboarding_complete_step', 'api_onboarding_dismiss'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['api_onboarding_show', 'api_onboarding_complete_step', 'api_onboarding_dismiss'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        if ($this->updatedAt === null) {
            $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function setUuid(string $uuid): static
    {
        $this->uuid = $uuid;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return string[]
     */
    public function getCompletedSteps(): array
    {
        return $this->completedSteps;
    }

    public function setCompletedSteps(array $completedSteps): static
    {
        $this->completedSteps = $completedSteps;

        return $this;
    }

    public function addCompletedStep(string $stepValue): static
    {
        if (!in_array($stepValue, $this->completedSteps, true)) {
            $this->completedSteps[] = $stepValue;
        }

        return $this;
    }

    public function isStepCompleted(string $stepValue): bool
    {
        return in_array($stepValue, $this->completedSteps, true);
    }

    public function getDismissedAt(): ?\DateTimeImmutable
    {
        return $this->dismissedAt;
    }

    public function setDismissedAt(?\DateTimeImmutable $dismissedAt): static
    {
        $this->dismissedAt = $dismissedAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
