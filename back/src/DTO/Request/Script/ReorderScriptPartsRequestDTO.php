<?php

namespace App\DTO\Request\Script;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ReorderScriptPartsRequestDTO extends AbstractRequestDTO
{
    /** @var array<array{uuid: string, type: string}> */
    private array $orderedParts;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->orderedParts = $payload["orderedParts"] ?? [];
    }

    protected function buildObject(): array
    {
        return $this->orderedParts;
    }

    /**
     * @return array<array{uuid: string, type: string}>
     */
    public function getOrderedParts(): array
    {
        return $this->orderedParts;
    }
}
