<?php

namespace App\Entity;

use App\Entity\Enum\ScriptPartSuggestionAction;
use App\Entity\Enum\ScriptPartSuggestionStatus;
use App\Entity\Enum\ScriptPartType;
use App\Helper\DateHelper;
use App\Repository\ScriptPartSuggestionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptPartSuggestionRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Index(columns: ['script_id', 'status'])]
#[ORM\Index(columns: ['message_id'])]
class ScriptPartSuggestion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(enumType: ScriptPartSuggestionAction::class)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?ScriptPartSuggestionAction $action = null;

    #[ORM\Column(enumType: ScriptPartSuggestionStatus::class)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?ScriptPartSuggestionStatus $status = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?string $originalContent = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?string $proposedContent = null;

    #[ORM\Column(enumType: ScriptPartType::class, nullable: true)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?ScriptPartType $proposedType = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?int $proposedPosition = null;

    #[ORM\Column]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptPartSuggestions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

    #[ORM\ManyToOne(inversedBy: 'scriptPartSuggestions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Message $message = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?ScriptPart $scriptPart = null;

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

        if ($this->updatedAt === null) {
            $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
        }

        if ($this->status === null) {
            $this->status = ScriptPartSuggestionStatus::Pending;
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

    public function getAction(): ?ScriptPartSuggestionAction
    {
        return $this->action;
    }

    public function setAction(ScriptPartSuggestionAction $action): static
    {
        $this->action = $action;

        return $this;
    }

    public function getStatus(): ?ScriptPartSuggestionStatus
    {
        return $this->status;
    }

    public function setStatus(ScriptPartSuggestionStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getOriginalContent(): ?string
    {
        return $this->originalContent;
    }

    public function setOriginalContent(?string $originalContent): static
    {
        $this->originalContent = $originalContent;

        return $this;
    }

    public function getProposedContent(): ?string
    {
        return $this->proposedContent;
    }

    public function setProposedContent(?string $proposedContent): static
    {
        $this->proposedContent = $proposedContent;

        return $this;
    }

    public function getProposedType(): ?ScriptPartType
    {
        return $this->proposedType;
    }

    public function setProposedType(?ScriptPartType $proposedType): static
    {
        $this->proposedType = $proposedType;

        return $this;
    }

    public function getProposedPosition(): ?int
    {
        return $this->proposedPosition;
    }

    public function setProposedPosition(?int $proposedPosition): static
    {
        $this->proposedPosition = $proposedPosition;

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

    public function getMessage(): ?Message
    {
        return $this->message;
    }

    public function setMessage(?Message $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getScriptPart(): ?ScriptPart
    {
        return $this->scriptPart;
    }

    public function setScriptPart(?ScriptPart $scriptPart): static
    {
        $this->scriptPart = $scriptPart;

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
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    public function getScriptPartUuid(): ?string
    {
        return $this->scriptPart?->getUuid();
    }

    #[Groups([
        'api_script_part_suggestions_list',
        'api_script_part_suggestions_show',
    ])]
    public function getMessageUuid(): ?string
    {
        return $this->message?->getUuid();
    }
}
