<?php

namespace App\DTO\QueryParam\ScriptVoiceOver;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListScriptVoiceOversQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $scriptUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->scriptUuid = $queryParams["scriptUuid"];
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }
}
