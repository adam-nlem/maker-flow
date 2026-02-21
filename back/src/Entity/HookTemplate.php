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

        'api_scripts_list',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_list',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_list',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?string $content = null;

    #[ORM\Column]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_list',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private bool $isPublic = false;

    #[ORM\Column]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_list',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_hook_templates_list',
        'api_hook_templates_create',
        'api_hook_templates_update',
        'api_hook_templates_show',

        'api_scripts_list',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
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

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
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
}
