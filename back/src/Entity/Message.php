<?php

namespace App\Entity;

use App\Entity\Enum\MessageType;
use App\Helper\DateHelper;
use App\Repository\MessageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?string $content = null;

    #[ORM\Column(enumType: MessageType::class)]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?MessageType $type = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?array $suggestedAnswers = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?array $metadata = null;

    #[ORM\Column]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_chat_messages_list',
        'api_chat_messages_create',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Chat $chat = null;

    #[ORM\ManyToOne(targetEntity: Message::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Message $parentMessage = null;

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

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getType(): ?MessageType
    {
        return $this->type;
    }

    public function setType(MessageType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getSuggestedAnswers(): ?array
    {
        return $this->suggestedAnswers;
    }

    public function setSuggestedAnswers(?array $suggestedAnswers): static
    {
        $this->suggestedAnswers = $suggestedAnswers;

        return $this;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;

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

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(?Chat $chat): static
    {
        $this->chat = $chat;

        return $this;
    }

    public function getParentMessage(): ?Message
    {
        return $this->parentMessage;
    }

    public function setParentMessage(?Message $parentMessage): static
    {
        $this->parentMessage = $parentMessage;

        return $this;
    }
}
