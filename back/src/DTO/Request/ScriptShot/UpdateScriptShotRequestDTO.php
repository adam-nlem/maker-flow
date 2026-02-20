<?php

namespace App\DTO\Request\ScriptShot;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ShotType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptShotRequestDTO extends AbstractRequestDTO
{
    private ?string $content;
    private ?ShotType $shotType;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
        $this->shotType = isset($payload["shotType"]) ? ShotType::tryFrom($payload["shotType"]) : null;
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->getContent(),
            'shotType' => $this->getShotType(),
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getShotType(): ?ShotType
    {
        return $this->shotType;
    }
}
