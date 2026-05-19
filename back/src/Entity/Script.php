<?php

namespace App\Entity;

use App\Entity\Enum\ContentType;
use App\Entity\Enum\ScriptStatus;
use App\Helper\DateHelper;
use App\Repository\ScriptRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Script
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
        'api_post_groups_list',
        'api_post_groups_show',
        'api_post_drafts_list',
        'api_post_drafts_show',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
        'api_post_groups_list',
        'api_post_groups_show',
        'api_post_drafts_list',
        'api_post_drafts_show',
    ])]
    private ?string $title = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
        'api_post_groups_list',
        'api_post_groups_show',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?array $platforms = null;

    #[ORM\Column(enumType: ContentType::class, nullable: true)]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?ContentType $contentType = null;

    #[ORM\Column(enumType: ScriptStatus::class, nullable: true)]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?ScriptStatus $status = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'scripts')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Project $project = null;

    #[ORM\OneToOne(inversedBy: 'script')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?PostGroup $postGroup = null;

    #[ORM\OneToOne(mappedBy: 'script', targetEntity: PostDraft::class)]
    private ?PostDraft $postDraft = null;

    /**
     * @var Collection<int, ScriptTag>
     */
    #[ORM\ManyToMany(targetEntity: ScriptTag::class, inversedBy: 'scripts')]
    #[Groups([
        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private Collection $tags;

    /**
     * @var Collection<int, ScriptPart>
     */
    #[ORM\OneToMany(targetEntity: ScriptPart::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptParts;

    /**
     * @var Collection<int, ScriptPartSuggestion>
     */
    #[ORM\OneToMany(targetEntity: ScriptPartSuggestion::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptPartSuggestions;

    /**
     * @var Collection<int, Chat>
     */
    #[ORM\OneToMany(targetEntity: Chat::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $chats;

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

        $this->tags = new ArrayCollection();
        $this->scriptParts = new ArrayCollection();
        $this->scriptPartSuggestions = new ArrayCollection();
        $this->chats = new ArrayCollection();
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

    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(?\DateTimeImmutable $publishedAt): static
    {
        $this->publishedAt = $publishedAt;

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

    public function getStatus(): ?ScriptStatus
    {
        return $this->status;
    }

    public function setStatus(?ScriptStatus $status): static
    {
        $this->status = $status;

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

    public function getPostGroup(): ?PostGroup
    {
        return $this->postGroup;
    }

    public function setPostGroup(?PostGroup $postGroup): static
    {
        $this->postGroup = $postGroup;

        return $this;
    }

    public function getPostDraft(): ?PostDraft
    {
        return $this->postDraft;
    }

    /**
     * @return Collection<int, ScriptTag>
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(ScriptTag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
        }

        return $this;
    }

    public function removeTag(ScriptTag $tag): static
    {
        $this->tags->removeElement($tag);

        return $this;
    }

    /**
     * @return Collection<int, ScriptPart>
     */
    public function getScriptParts(): Collection
    {
        return $this->scriptParts;
    }

    /**
     * @return Collection<int, ScriptPartSuggestion>
     */
    public function getScriptPartSuggestions(): Collection
    {
        return $this->scriptPartSuggestions;
    }

    /**
     * @return Collection<int, Chat>
     */
    public function getChats(): Collection
    {
        return $this->chats;
    }
}
