<?php

namespace App\DTO\Request\ScriptGeneration;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\OpeningStyle;
use App\Entity\Enum\ScriptGenerationStatus;
use App\Entity\Enum\ScriptGoal;
use App\Entity\ScriptGeneration;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class GenerateScriptRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $topic;
    private ScriptGoal $goal;
    private ?string $keyPoints;
    private OpeningStyle $openingStyle;
    private ?string $callToAction;
    private ?string $extraContext;
    private array $activeSkills;
    private array $skillInputs;
    private bool $replaceExisting;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload["scriptUuid"];
        $this->topic = $payload["topic"];
        $this->goal = ScriptGoal::from($payload["goal"]);
        $this->keyPoints = $payload["keyPoints"] ?? null;
        $this->openingStyle = OpeningStyle::from($payload["openingStyle"]);
        $this->callToAction = $payload["callToAction"] ?? null;
        $this->extraContext = $payload["extraContext"] ?? null;
        $this->activeSkills = $payload["activeSkills"] ?? [];
        $this->skillInputs = $payload["skillInputs"] ?? [];
        $this->replaceExisting = $payload["replaceExisting"] ?? false;
    }

    protected function buildObject(): ScriptGeneration
    {
        $generation = new ScriptGeneration();

        return $generation
            ->setStatus(ScriptGenerationStatus::Pending)
            ->setTopic($this->topic)
            ->setGoal($this->goal)
            ->setKeyPoints($this->keyPoints)
            ->setOpeningStyle($this->openingStyle)
            ->setCallToAction($this->callToAction)
            ->setExtraContext($this->extraContext)
            ->setActiveSkills($this->activeSkills)
            ->setSkillInputs($this->skillInputs)
            ->setReplaceExisting($this->replaceExisting);
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
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

    public function isReplaceExisting(): bool
    {
        return $this->replaceExisting;
    }
}
