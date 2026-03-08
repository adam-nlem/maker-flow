<?php

namespace App\Entity;

use App\Entity\Enum\ScriptPartType;
use App\Helper\DateHelper;
use App\Repository\ScriptDialogueRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptDialogueRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ScriptDialogue
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private ?int $position = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptDialogues')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: ScriptGeneration::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?ScriptGeneration $scriptGeneration = null;

    /**
     * @var Collection<int, DialogueSubject>
     */
    #[ORM\OneToMany(targetEntity: DialogueSubject::class, mappedBy: 'scriptDialogue', cascade: ['remove'], orphanRemoval: true)]
    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    private Collection $dialogueSubjects;

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

        $this->dialogueSubjects = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
    }

    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_dialogues_update',
        'api_scripts_parts_list',
    ])]
    public function getType(): string
    {
        return ScriptPartType::Dialogue->value;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, DialogueSubject>
     */
    public function getDialogueSubjects(): Collection
    {
        return $this->dialogueSubjects;
    }

    public function addDialogueSubject(DialogueSubject $dialogueSubject): static
    {
        if (!$this->dialogueSubjects->contains($dialogueSubject)) {
            $this->dialogueSubjects->add($dialogueSubject);
            $dialogueSubject->setScriptDialogue($this);
        }

        return $this;
    }

    public function removeDialogueSubject(DialogueSubject $dialogueSubject): static
    {
        if ($this->dialogueSubjects->removeElement($dialogueSubject)) {
            if ($dialogueSubject->getScriptDialogue() === $this) {
                $dialogueSubject->setScriptDialogue(null);
            }
        }

        return $this;
    }

    #[Groups([
        'api_scripts_dialogues_list',
        'api_scripts_dialogues_create',
        'api_scripts_parts_list',
    ])]
    public function getGenerationUuid(): ?string
    {
        return $this->scriptGeneration?->getUuid();
    }

    public function getScriptGeneration(): ?ScriptGeneration
    {
        return $this->scriptGeneration;
    }

    public function setScriptGeneration(?ScriptGeneration $scriptGeneration): static
    {
        $this->scriptGeneration = $scriptGeneration;

        return $this;
    }
}
