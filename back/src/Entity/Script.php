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
     * @var Collection<int, ScriptChapter>
     */
    #[ORM\OneToMany(targetEntity: ScriptChapter::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptChapters;

    /**
     * @var Collection<int, ScriptVoiceOver>
     */
    #[ORM\OneToMany(targetEntity: ScriptVoiceOver::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptVoiceOvers;

    /**
     * @var Collection<int, ScriptDialogue>
     */
    #[ORM\OneToMany(targetEntity: ScriptDialogue::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptDialogues;

    /**
     * @var Collection<int, ScriptShot>
     */
    #[ORM\OneToMany(targetEntity: ScriptShot::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptShots;

    /**
     * @var Collection<int, ScriptText>
     */
    #[ORM\OneToMany(targetEntity: ScriptText::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptTexts;

    /**
     * @var Collection<int, ScriptCallToAction>
     */
    #[ORM\OneToMany(targetEntity: ScriptCallToAction::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptCallToActions;

    /**
     * @var Collection<int, ScriptRetentionCue>
     */
    #[ORM\OneToMany(targetEntity: ScriptRetentionCue::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptRetentionCues;

    /**
     * @var Collection<int, ScriptHook>
     */
    #[ORM\OneToMany(targetEntity: ScriptHook::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptHooks;

    /**
     * @var Collection<int, ScriptGeneration>
     */
    #[ORM\OneToMany(targetEntity: ScriptGeneration::class, mappedBy: 'script', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptGenerations;

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
        $this->scriptChapters = new ArrayCollection();
        $this->scriptVoiceOvers = new ArrayCollection();
        $this->scriptDialogues = new ArrayCollection();
        $this->scriptShots = new ArrayCollection();
        $this->scriptTexts = new ArrayCollection();
        $this->scriptCallToActions = new ArrayCollection();
        $this->scriptRetentionCues = new ArrayCollection();
        $this->scriptHooks = new ArrayCollection();
        $this->scriptGenerations = new ArrayCollection();
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
     * @return Collection<int, ScriptChapter>
     */
    public function getScriptChapters(): Collection
    {
        return $this->scriptChapters;
    }

    public function addScriptChapter(ScriptChapter $scriptChapter): static
    {
        if (!$this->scriptChapters->contains($scriptChapter)) {
            $this->scriptChapters->add($scriptChapter);
            $scriptChapter->setScript($this);
        }

        return $this;
    }

    public function removeScriptChapter(ScriptChapter $scriptChapter): static
    {
        if ($this->scriptChapters->removeElement($scriptChapter)) {
            if ($scriptChapter->getScript() === $this) {
                $scriptChapter->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptVoiceOver>
     */
    public function getScriptVoiceOvers(): Collection
    {
        return $this->scriptVoiceOvers;
    }

    public function addScriptVoiceOver(ScriptVoiceOver $scriptVoiceOver): static
    {
        if (!$this->scriptVoiceOvers->contains($scriptVoiceOver)) {
            $this->scriptVoiceOvers->add($scriptVoiceOver);
            $scriptVoiceOver->setScript($this);
        }

        return $this;
    }

    public function removeScriptVoiceOver(ScriptVoiceOver $scriptVoiceOver): static
    {
        if ($this->scriptVoiceOvers->removeElement($scriptVoiceOver)) {
            if ($scriptVoiceOver->getScript() === $this) {
                $scriptVoiceOver->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptDialogue>
     */
    public function getScriptDialogues(): Collection
    {
        return $this->scriptDialogues;
    }

    public function addScriptDialogue(ScriptDialogue $scriptDialogue): static
    {
        if (!$this->scriptDialogues->contains($scriptDialogue)) {
            $this->scriptDialogues->add($scriptDialogue);
            $scriptDialogue->setScript($this);
        }

        return $this;
    }

    public function removeScriptDialogue(ScriptDialogue $scriptDialogue): static
    {
        if ($this->scriptDialogues->removeElement($scriptDialogue)) {
            if ($scriptDialogue->getScript() === $this) {
                $scriptDialogue->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptShot>
     */
    public function getScriptShots(): Collection
    {
        return $this->scriptShots;
    }

    public function addScriptShot(ScriptShot $scriptShot): static
    {
        if (!$this->scriptShots->contains($scriptShot)) {
            $this->scriptShots->add($scriptShot);
            $scriptShot->setScript($this);
        }

        return $this;
    }

    public function removeScriptShot(ScriptShot $scriptShot): static
    {
        if ($this->scriptShots->removeElement($scriptShot)) {
            if ($scriptShot->getScript() === $this) {
                $scriptShot->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptText>
     */
    public function getScriptTexts(): Collection
    {
        return $this->scriptTexts;
    }

    public function addScriptText(ScriptText $scriptText): static
    {
        if (!$this->scriptTexts->contains($scriptText)) {
            $this->scriptTexts->add($scriptText);
            $scriptText->setScript($this);
        }

        return $this;
    }

    public function removeScriptText(ScriptText $scriptText): static
    {
        if ($this->scriptTexts->removeElement($scriptText)) {
            if ($scriptText->getScript() === $this) {
                $scriptText->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptCallToAction>
     */
    public function getScriptCallToActions(): Collection
    {
        return $this->scriptCallToActions;
    }

    public function addScriptCallToAction(ScriptCallToAction $scriptCallToAction): static
    {
        if (!$this->scriptCallToActions->contains($scriptCallToAction)) {
            $this->scriptCallToActions->add($scriptCallToAction);
            $scriptCallToAction->setScript($this);
        }

        return $this;
    }

    public function removeScriptCallToAction(ScriptCallToAction $scriptCallToAction): static
    {
        if ($this->scriptCallToActions->removeElement($scriptCallToAction)) {
            if ($scriptCallToAction->getScript() === $this) {
                $scriptCallToAction->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptRetentionCue>
     */
    public function getScriptRetentionCues(): Collection
    {
        return $this->scriptRetentionCues;
    }

    public function addScriptRetentionCue(ScriptRetentionCue $scriptRetentionCue): static
    {
        if (!$this->scriptRetentionCues->contains($scriptRetentionCue)) {
            $this->scriptRetentionCues->add($scriptRetentionCue);
            $scriptRetentionCue->setScript($this);
        }

        return $this;
    }

    public function removeScriptRetentionCue(ScriptRetentionCue $scriptRetentionCue): static
    {
        if ($this->scriptRetentionCues->removeElement($scriptRetentionCue)) {
            if ($scriptRetentionCue->getScript() === $this) {
                $scriptRetentionCue->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptHook>
     */
    public function getScriptHooks(): Collection
    {
        return $this->scriptHooks;
    }

    public function addScriptHook(ScriptHook $scriptHook): static
    {
        if (!$this->scriptHooks->contains($scriptHook)) {
            $this->scriptHooks->add($scriptHook);
            $scriptHook->setScript($this);
        }

        return $this;
    }

    public function removeScriptHook(ScriptHook $scriptHook): static
    {
        if ($this->scriptHooks->removeElement($scriptHook)) {
            if ($scriptHook->getScript() === $this) {
                $scriptHook->setScript(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ScriptGeneration>
     */
    public function getScriptGenerations(): Collection
    {
        return $this->scriptGenerations;
    }
}
