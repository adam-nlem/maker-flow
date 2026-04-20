<?php

namespace App\Entity;

use App\Entity\Enum\AiModel;
use App\Helper\DateHelper;
use App\Repository\ChatRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ChatRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Chat
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_chats_list',
        'api_chats_create',
        'api_chats_show',
        'api_chats_update',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'api_chats_list',
        'api_chats_create',
        'api_chats_show',
        'api_chats_update',
    ])]
    private ?string $title = null;

    #[ORM\Column(enumType: AiModel::class)]
    #[Groups([
        'api_chats_list',
        'api_chats_create',
        'api_chats_show',
        'api_chats_update',
    ])]
    private ?AiModel $aiModel = null;

    #[ORM\Column]
    #[Groups([
        'api_chats_list',
        'api_chats_create',
        'api_chats_show',
        'api_chats_update',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_chats_list',
        'api_chats_create',
        'api_chats_show',
        'api_chats_update',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'chats')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'chat', cascade: ['remove'], orphanRemoval: true)]
    private Collection $messages;

    /**
     * @var Collection<int, ScriptVersion>
     */
    #[ORM\OneToMany(targetEntity: ScriptVersion::class, mappedBy: 'chat', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptVersions;

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

        $this->messages = new ArrayCollection();
        $this->scriptVersions = new ArrayCollection();
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

    public function setTitle(?string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getAiModel(): ?AiModel
    {
        return $this->aiModel;
    }

    public function setAiModel(AiModel $aiModel): static
    {
        $this->aiModel = $aiModel;

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

    public function getScript(): ?Script
    {
        return $this->script;
    }

    public function setScript(?Script $script): static
    {
        $this->script = $script;

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    /**
     * @return Collection<int, ScriptVersion>
     */
    public function getScriptVersions(): Collection
    {
        return $this->scriptVersions;
    }
}
