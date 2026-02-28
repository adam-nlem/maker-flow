<?php

namespace App\DTO\Request\ScriptShot;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ShotType;
use App\Entity\ScriptShot;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptShotRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $content;
    private ShotType $shotType;
    private ?int $position;
    private ?string $generationUuid = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload["scriptUuid"];
        $this->content = $payload["content"];
        $this->shotType = ShotType::tryFrom($payload["shotType"] ?? "") ?? ShotType::ARoll;
        $this->position = $payload["position"] ?? null;
        $this->generationUuid = $payload["generationUuid"] ?? null;
    }

    protected function buildObject(): ScriptShot
    {
        $shot = new ScriptShot();

        return $shot
            ->setContent($this->getContent())
            ->setShotType($this->getShotType());
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getShotType(): ShotType
    {
        return $this->shotType;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function getGenerationUuid(): ?string
    {
        return $this->generationUuid;
    }
}
