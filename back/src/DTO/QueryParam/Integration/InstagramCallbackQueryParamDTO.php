<?php

namespace App\DTO\QueryParam\Integration;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class InstagramCallbackQueryParamDTO extends AbstractQueryParamDTO
{
    private ?string $code;

    private ?string $state;

    private ?string $error;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->code = $queryParams["code"] ?? null;
        $this->state = $queryParams["state"] ?? null;
        $this->error = $queryParams["error"] ?? null;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function getState(): ?string
    {
        return $this->state;
    }

    public function getError(): ?string
    {
        return $this->error;
    }
}
