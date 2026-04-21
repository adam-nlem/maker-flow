<?php

namespace App\DTO\Request\Chat;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Chat;
use App\Entity\Enum\AiModel;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateChatRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private AiModel $aiModel;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload["scriptUuid"];
        $this->aiModel = AiModel::from($payload["aiModel"]);
    }

    protected function buildObject(): Chat
    {
        return (new Chat())
            ->setAiModel($this->aiModel);
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getAiModel(): AiModel
    {
        return $this->aiModel;
    }
}
