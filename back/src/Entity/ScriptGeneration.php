<?php

namespace App\Entity;

use App\Entity\Enum\AiModel;
use App\Entity\Enum\OpeningStyle;
use App\Entity\Enum\ScriptGenerationStatus;
use App\Entity\Enum\ScriptGoal;
use App\Entity\Enum\VideoDuration;
use App\Helper\DateHelper;
use App\Repository\ScriptGenerationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptGenerationRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ScriptGeneration
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(enumType: ScriptGenerationStatus::class)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?ScriptGenerationStatus $status = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?string $topic = null;

    #[ORM\Column(enumType: ScriptGoal::class)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?ScriptGoal $goal = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?string $keyPoints = null;

    #[ORM\Column(enumType: OpeningStyle::class)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?OpeningStyle $openingStyle = null;

    #[ORM\Column(enumType: VideoDuration::class)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?VideoDuration $duration = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?string $callToAction = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?string $extraContext = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private array $activeSkills = [];

    #[ORM\Column(type: Types::JSON)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private array $skillInputs = [];

    #[ORM\Column(enumType: AiModel::class, options: ['default' => 'gemini'])]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private AiModel $aiModel = AiModel::Gemini;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $assembledPrompt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?string $errorMessage = null;

    #[ORM\Column]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_create',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_script_generations_show',
        'api_script_generations_list',
        'api_script_generations_update',
    ])]
    private ?\DateTimeImmutable $completedAt = null;

    #[ORM\ManyToOne(inversedBy: 'scriptGenerations')]
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

    public function getStatus(): ?ScriptGenerationStatus
    {
        return $this->status;
    }

    public function setStatus(ScriptGenerationStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getTopic(): ?string
    {
        return $this->topic;
    }

    public function setTopic(string $topic): static
    {
        $this->topic = $topic;

        return $this;
    }

    public function getGoal(): ?ScriptGoal
    {
        return $this->goal;
    }

    public function setGoal(ScriptGoal $goal): static
    {
        $this->goal = $goal;

        return $this;
    }

    public function getKeyPoints(): ?string
    {
        return $this->keyPoints;
    }

    public function setKeyPoints(?string $keyPoints): static
    {
        $this->keyPoints = $keyPoints;

        return $this;
    }

    public function getOpeningStyle(): ?OpeningStyle
    {
        return $this->openingStyle;
    }

    public function setOpeningStyle(OpeningStyle $openingStyle): static
    {
        $this->openingStyle = $openingStyle;

        return $this;
    }

    public function getDuration(): ?VideoDuration
    {
        return $this->duration;
    }

    public function setDuration(VideoDuration $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getCallToAction(): ?string
    {
        return $this->callToAction;
    }

    public function setCallToAction(?string $callToAction): static
    {
        $this->callToAction = $callToAction;

        return $this;
    }

    public function getExtraContext(): ?string
    {
        return $this->extraContext;
    }

    public function setExtraContext(?string $extraContext): static
    {
        $this->extraContext = $extraContext;

        return $this;
    }

    public function getActiveSkills(): array
    {
        return $this->activeSkills;
    }

    public function setActiveSkills(array $activeSkills): static
    {
        $this->activeSkills = $activeSkills;

        return $this;
    }

    public function getSkillInputs(): array
    {
        return $this->skillInputs;
    }

    public function setSkillInputs(array $skillInputs): static
    {
        $this->skillInputs = $skillInputs;

        return $this;
    }

    public function getAiModel(): AiModel
    {
        return $this->aiModel;
    }

    public function setAiModel(AiModel $aiModel): static
    {
        $this->aiModel = $aiModel;

        return $this;
    }

    public function getAssembledPrompt(): ?string
    {
        return $this->assembledPrompt;
    }

    public function setAssembledPrompt(?string $assembledPrompt): static
    {
        $this->assembledPrompt = $assembledPrompt;

        return $this;
    }

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function setErrorMessage(?string $errorMessage): static
    {
        $this->errorMessage = $errorMessage;

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

    public function getCompletedAt(): ?\DateTimeImmutable
    {
        return $this->completedAt;
    }

    public function setCompletedAt(?\DateTimeImmutable $completedAt): static
    {
        $this->completedAt = $completedAt;

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
