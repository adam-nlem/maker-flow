<?php

namespace App\DTO\Request\DialogueSubject;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ReorderDialogueSubjectsRequestDTO extends AbstractRequestDTO
{
    private string $scriptDialogueUuid;

    /** @var string[] */
    private array $orderedUuids;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptDialogueUuid = $payload["scriptDialogueUuid"];
        $this->orderedUuids = $payload["orderedUuids"] ?? [];
    }

    protected function buildObject(): array
    {
        return $this->orderedUuids;
    }

    public function getScriptDialogueUuid(): string
    {
        return $this->scriptDialogueUuid;
    }

    /**
     * @return string[]
     */
    public function getOrderedUuids(): array
    {
        return $this->orderedUuids;
    }
}
