<?php

namespace App\Entity;

use App\Entity\Enum\ScriptPartType;
use App\Entity\Enum\ShotType;
use App\Helper\DateHelper;
use App\Repository\ScriptShotRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptShotRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ScriptShot
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    private ?string $content = null;

    #[ORM\Column(enumType: ShotType::class)]
    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    private ?ShotType $shotType = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    private ?int $position = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptShots')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: ScriptGeneration::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?ScriptGeneration $scriptGeneration = null;

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

    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_shots_update',
        'api_scripts_parts_list',
    ])]
    public function getType(): string
    {
        return ScriptPartType::Shot->value;
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

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getShotType(): ?ShotType
    {
        return $this->shotType;
    }

    public function setShotType(ShotType $shotType): static
    {
        $this->shotType = $shotType;

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

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

    public function getScript(): ?Script
    {
        return $this->script;
    }

    public function setScript(?Script $script): static
    {
        $this->script = $script;

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

    #[Groups([
        'api_scripts_shots_list',
        'api_scripts_shots_create',
        'api_scripts_parts_list',
    ])]
    public function getGenerationUuid(): ?string
    {
        return $this->scriptGeneration?->getUuid();
    }

    public function getScriptGeneration(): ?ScriptGeneration
    {
        return $this->scriptGeneration;
    }

    public function setScriptGeneration(?ScriptGeneration $scriptGeneration): static
    {
        $this->scriptGeneration = $scriptGeneration;

        return $this;
    }
}
