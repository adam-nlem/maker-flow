<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\HookTemplateRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: HookTemplateRepository::class)]
#[ORM\HasLifecycleCallbacks]
class HookTemplate
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_hooks_list',
        'api_scripts_hooks_create',
        'api_scripts_hooks_update',
        'api_scripts_parts_list',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_hooks_list',
        'api_scripts_hooks_create',
        'api_scripts_hooks_update',
        'api_scripts_parts_list',
    ])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_hooks_list',
        'api_scripts_hooks_create',
        'api_scripts_hooks_update',
        'api_scripts_parts_list',
    ])]
    private ?string $content = null;

    #[ORM\Column]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_hooks_list',
        'api_scripts_hooks_create',
        'api_scripts_hooks_update',
        'api_scripts_parts_list',
    ])]
    private bool $isPublic = false;

    #[ORM\Column]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_hooks_list',
        'api_scripts_hooks_create',
        'api_scripts_hooks_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_hooks_list',
        'api_scripts_hooks_create',
        'api_scripts_hooks_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: Agency::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Agency $agency = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $createdBy = null;

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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

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

    public function isPublic(): bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;

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

    public function getAgency(): ?Agency
    {
        return $this->agency;
    }

    public function setAgency(?Agency $agency): static
    {
        $this->agency = $agency;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }
}
