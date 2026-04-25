<?php

namespace App\DTO\QueryParam\ScriptPartSuggestion;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\ScriptPartSuggestionStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListScriptPartSuggestionsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $scriptUuid;

    private ?ScriptPartSuggestionStatus $status = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->scriptUuid = $queryParams['scriptUuid'] ?? '';
        $this->status = isset($queryParams['status'])
            ? ScriptPartSuggestionStatus::tryFrom($queryParams['status'])
            : null;
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getStatus(): ?ScriptPartSuggestionStatus
    {
        return $this->status;
    }
}
