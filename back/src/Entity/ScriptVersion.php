<?php

namespace App\Entity;

use App\Entity\Enum\ScriptVersionStatus;
use App\Helper\DateHelper;
use App\Repository\ScriptVersionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptVersionRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ScriptVersion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_script_versions_list',
        'api_script_versions_show',
        'api_script_versions_update',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(enumType: ScriptVersionStatus::class)]
    #[Groups([
        'api_script_versions_list',
        'api_script_versions_show',
        'api_script_versions_update',
    ])]
    private ?ScriptVersionStatus $status = null;

    #[ORM\Column]
    #[Groups([
        'api_script_versions_list',
        'api_script_versions_show',
        'api_script_versions_update',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_script_versions_list',
        'api_script_versions_show',
        'api_script_versions_update',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptVersions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

    #[ORM\ManyToOne(inversedBy: 'scriptVersions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Chat $chat = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Message $message = null;

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

    public function getStatus(): ?ScriptVersionStatus
    {
        return $this->status;
    }

    public function setStatus(ScriptVersionStatus $status): static
    {
        $this->status = $status;

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

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(?Chat $chat): static
    {
        $this->chat = $chat;

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
}
