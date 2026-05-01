<?php

namespace App\DTO\Request\ScriptPart;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ScriptPartType;
use App\Entity\ScriptPart;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptPartRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $content;
    private ScriptPartType $type;
    private ?int $position = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload['scriptUuid'] ?? '';
        $this->content = $payload['content'] ?? '';
        $this->type = isset($payload['type'])
            ? (ScriptPartType::tryFrom($payload['type']) ?? ScriptPartType::Text)
            : ScriptPartType::Text;
        $this->position = isset($payload['position']) ? (int) $payload['position'] : null;
    }

    protected function buildObject(): ScriptPart
    {
        $part = new ScriptPart();
        $part->setContent($this->content)
            ->setType($this->type);

        if ($this->position !== null) {
            $part->setPosition($this->position);
        }

        return $part;
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getType(): ScriptPartType
    {
        return $this->type;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }
}
