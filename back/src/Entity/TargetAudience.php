<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\TargetAudienceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: TargetAudienceRepository::class)]
#[ORM\UniqueConstraint(name: 'unique_name_creator_profile', columns: ['name', 'creator_profile_id'])]
#[ORM\HasLifecycleCallbacks]
class TargetAudience
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_target_audiences_list',
        'api_target_audiences_create',
        'api_target_audiences_delete',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_target_audiences_list',
        'api_target_audiences_create',
        'api_target_audiences_delete',
    ])]
    private ?string $name = null;

    #[ORM\Column]
    #[Groups([
        'api_target_audiences_list',
        'api_target_audiences_create',
        'api_target_audiences_delete',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_target_audiences_list',
        'api_target_audiences_create',
        'api_target_audiences_delete',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'targetAudiences')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?CreatorProfile $creatorProfile = null;

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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

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

    public function getCreatorProfile(): ?CreatorProfile
    {
        return $this->creatorProfile;
    }

    public function setCreatorProfile(?CreatorProfile $creatorProfile): static
    {
        $this->creatorProfile = $creatorProfile;

        return $this;
    }
}
