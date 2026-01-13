<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Entity\Integration;
use App\Entity\User;
use App\Entity\UserModule;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsProfileRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsProfileRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsProfile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    private ?string $uuid = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 255)]
    private ?string $username = null;

    #[ORM\Column(length: 255)]
    private ?string $displayName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatarUrl = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\OneToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Integration $integration = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?UserModule $userModule = null;

    public function __construct()
    {
        if (null === $this->uuid) {
            $this->uuid = Uuid::v4();
        }

        if (null === $this->createdAt) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
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

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getDisplayName(): ?string
    {
        return $this->displayName;
    }

    public function setDisplayName(string $displayName): static
    {
        $this->displayName = $displayName;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(?string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;

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

    public function getIntegration(): ?Integration
    {
        return $this->integration;
    }

    public function setIntegration(?Integration $integration): static
    {
        $this->integration = $integration;

        return $this;
    }

    public function getUserModule(): ?UserModule
    {
        return $this->userModule;
    }

    public function setUserModule(?UserModule $userModule): static
    {
        $this->userModule = $userModule;

        return $this;
    }
}
