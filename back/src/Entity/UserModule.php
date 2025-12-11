<?php

namespace App\Entity;

use App\Entity\Enum\ModuleSize;
use App\Helper\DateHelper;
use App\Repository\UserModuleRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: UserModuleRepository::class)]
class UserModule
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID, unique: true)]

    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?string $uuid = null;

    #[ORM\Column]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?int $xIndex = null;

    #[ORM\Column]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?int $yIndex = null;

    #[ORM\Column(enumType: ModuleSize::class)]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?ModuleSize $size = null;

    #[ORM\Column]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?bool $isActive = null;

    #[ORM\Column]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?bool $isHidden = null;

    #[ORM\ManyToOne(inversedBy: 'userModules')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'userModules')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([
        'api_user_modules_create',
        'api_project_get_user_modules'
    ])]
    private ?Module $module = null;

    #[ORM\ManyToOne(inversedBy: 'userModules')]
    private ?Integration $integration = null;

    #[ORM\ManyToOne(inversedBy: 'userModules')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        if ($this->isActive === null) {
            $this->isActive = true;
        }

        if ($this->isHidden === null) {
            $this->isHidden = false;
        }
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

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getXIndex(): ?int
    {
        return $this->xIndex;
    }

    public function setXIndex(int $xIndex): static
    {
        $this->xIndex = $xIndex;

        return $this;
    }

    public function getYIndex(): ?int
    {
        return $this->yIndex;
    }

    public function setYIndex(int $yIndex): static
    {
        $this->yIndex = $yIndex;

        return $this;
    }

    public function getSize(): ?ModuleSize
    {
        return $this->size;
    }

    public function setSize(ModuleSize $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function isHidden(): ?bool
    {
        return $this->isHidden;
    }

    public function setIsHidden(bool $isHidden): static
    {
        $this->isHidden = $isHidden;

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

    public function getModule(): ?Module
    {
        return $this->module;
    }

    public function setModule(?Module $module): static
    {
        $this->module = $module;

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
