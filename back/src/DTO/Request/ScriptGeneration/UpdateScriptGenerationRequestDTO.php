<?php

namespace App\DTO\Request\ScriptGeneration;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\AiModel;
use App\Entity\Enum\OpeningStyle;
use App\Entity\Enum\ScriptGoal;
use App\Entity\Enum\VideoDuration;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptGenerationRequestDTO extends AbstractRequestDTO
{
    private string $topic;
    private ScriptGoal $goal;
    private ?string $keyPoints;
    private OpeningStyle $openingStyle;
    private VideoDuration $duration;
    private ?string $callToAction;
    private ?string $extraContext;
    private array $activeSkills;
    private array $skillInputs;
    private AiModel $aiModel;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->topic = $payload["topic"];
        $this->goal = ScriptGoal::from($payload["goal"]);
        $this->keyPoints = $payload["keyPoints"] ?? null;
        $this->openingStyle = OpeningStyle::from($payload["openingStyle"]);
        $this->duration = VideoDuration::from($payload["duration"]);
        $this->callToAction = $payload["callToAction"] ?? null;
        $this->extraContext = $payload["extraContext"] ?? null;
        $this->activeSkills = $payload["activeSkills"] ?? [];
        $this->skillInputs = $payload["skillInputs"] ?? [];
        $this->aiModel = isset($payload["aiModel"]) ? AiModel::from($payload["aiModel"]) : AiModel::Gemini;
    }

    protected function buildObject(): array
    {
        return [];
    }

    public function getTopic(): string
    {
        return $this->topic;
    }

    public function getGoal(): ScriptGoal
    {
        return $this->goal;
    }

    public function getKeyPoints(): ?string
    {
        return $this->keyPoints;
    }

    public function getOpeningStyle(): OpeningStyle
    {
        return $this->openingStyle;
    }

    public function getDuration(): VideoDuration
    {
        return $this->duration;
    }

    public function getCallToAction(): ?string
    {
        return $this->callToAction;
    }

    public function getExtraContext(): ?string
    {
        return $this->extraContext;
    }

    public function getActiveSkills(): array
    {
        return $this->activeSkills;
    }

    public function getSkillInputs(): array
    {
        return $this->skillInputs;
    }

    public function getAiModel(): AiModel
    {
        return $this->aiModel;
    }
}
