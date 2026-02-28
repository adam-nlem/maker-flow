<?php

namespace App\Entity;

use App\Entity\Enum\ChapterType;
use App\Entity\Enum\ScriptPartType;
use App\Helper\DateHelper;
use App\Repository\ScriptChapterRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptChapterRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ScriptChapter
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?string $description = null;

    #[ORM\Column(enumType: ChapterType::class)]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?ChapterType $chapterType = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?int $position = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptChapters')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Script $script = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: ScriptGeneration::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?ScriptGeneration $scriptGeneration = null;

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
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
        'api_scripts_chapters_update',
        'api_scripts_parts_list',
    ])]
    public function getType(): string
    {
        return ScriptPartType::Chapter->value;
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

    public function getChapterType(): ?ChapterType
    {
        return $this->chapterType;
    }

    public function setChapterType(ChapterType $chapterType): static
    {
        $this->chapterType = $chapterType;

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

    #[Groups([
        'api_scripts_chapters_list',
        'api_scripts_chapters_create',
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
