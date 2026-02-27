<?php

namespace App\Entity;

use App\Entity\Enum\CallToActionType;
use App\Helper\DateHelper;
use App\Repository\ScriptCallToActionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptCallToActionRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ScriptCallToAction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    private ?string $content = null;

    #[ORM\Column(enumType: CallToActionType::class)]
    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    private ?CallToActionType $callToActionType = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    private ?int $position = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptCallToActions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

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

    #[Groups([
        'api_scripts_call_to_actions_list',
        'api_scripts_call_to_actions_create',
        'api_scripts_call_to_actions_update',
        'api_scripts_parts_list',
    ])]
    public function getType(): string
    {
        return 'call_to_action';
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

    public function getCallToActionType(): ?CallToActionType
    {
        return $this->callToActionType;
    }

    public function setCallToActionType(CallToActionType $callToActionType): static
    {
        $this->callToActionType = $callToActionType;

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

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
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
}
