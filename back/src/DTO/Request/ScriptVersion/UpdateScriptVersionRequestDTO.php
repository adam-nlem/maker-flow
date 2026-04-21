<?php

namespace App\DTO\Request\ScriptVersion;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ScriptVersionStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptVersionRequestDTO extends AbstractRequestDTO
{
    private ScriptVersionStatus $status;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->status = ScriptVersionStatus::from($payload["status"]);
    }

    protected function buildObject(): array
    {
        return [
            'status' => $this->getStatus(),
        ];
    }

    public function getStatus(): ScriptVersionStatus
    {
        return $this->status;
    }
}
