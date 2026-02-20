<?php

namespace App\DTO\QueryParam\DialogueSubject;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListDialogueSubjectsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $scriptDialogueUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->scriptDialogueUuid = $queryParams["scriptDialogueUuid"];
    }

    public function getScriptDialogueUuid(): string
    {
        return $this->scriptDialogueUuid;
    }
}
