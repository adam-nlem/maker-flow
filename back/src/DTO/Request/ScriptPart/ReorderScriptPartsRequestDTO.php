<?php

namespace App\DTO\Request\ScriptPart;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ReorderScriptPartsRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;

    /** @var array<array{uuid: string}> */
    private array $orderedParts;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload['scriptUuid'] ?? '';
        $this->orderedParts = $payload['orderedParts'] ?? [];
    }

    protected function buildObject(): array
    {
        return $this->orderedParts;
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    /**
     * @return array<array{uuid: string}>
     */
    public function getOrderedParts(): array
    {
        return $this->orderedParts;
    }
}
