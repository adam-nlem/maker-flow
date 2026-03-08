<?php

namespace App\Entity;

use App\Entity\Enum\ContentType;
use App\Entity\Enum\Tone;
use App\Helper\DateHelper;
use App\Repository\CreatorProfileRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CreatorProfileRepository::class)]
#[ORM\UniqueConstraint(name: 'unique_project_user', columns: ['project_id', 'user_id'])]
#[ORM\HasLifecycleCallbacks]
class CreatorProfile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?array $platforms = null;

    #[ORM\Column(enumType: ContentType::class, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?ContentType $contentType = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?string $niche = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?string $targetAudience = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?array $tones = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?array $signaturePhrases = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?array $neverList = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?string $styleSample = null;

    #[ORM\Column]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_creator_profiles_show',
        'api_creator_profiles_create',
        'api_creator_profiles_update',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'creatorProfiles')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Project $project = null;

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

    public function getPlatforms(): ?array
    {
        return $this->platforms;
    }

    public function setPlatforms(?array $platforms): static
    {
        $this->platforms = $platforms;

        return $this;
    }

    public function getContentType(): ?ContentType
    {
        return $this->contentType;
    }

    public function setContentType(?ContentType $contentType): static
    {
        $this->contentType = $contentType;

        return $this;
    }

    public function getNiche(): ?string
    {
        return $this->niche;
    }

    public function setNiche(?string $niche): static
    {
        $this->niche = $niche;

        return $this;
    }

    public function getTargetAudience(): ?string
    {
        return $this->targetAudience;
    }

    public function setTargetAudience(?string $targetAudience): static
    {
        $this->targetAudience = $targetAudience;

        return $this;
    }

    public function getTones(): ?array
    {
        return $this->tones;
    }

    public function setTones(?array $tones): static
    {
        $this->tones = $tones;

        return $this;
    }

    public function getSignaturePhrases(): ?array
    {
        return $this->signaturePhrases;
    }

    public function setSignaturePhrases(?array $signaturePhrases): static
    {
        $this->signaturePhrases = $signaturePhrases;

        return $this;
    }

    public function getNeverList(): ?array
    {
        return $this->neverList;
    }

    public function setNeverList(?array $neverList): static
    {
        $this->neverList = $neverList;

        return $this;
    }

    public function getStyleSample(): ?string
    {
        return $this->styleSample;
    }

    public function setStyleSample(?string $styleSample): static
    {
        $this->styleSample = $styleSample;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }
}
