<?php

namespace App\DTO\QueryParam\Message;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListMessagesQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $chatUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->chatUuid = $queryParams["chatUuid"];
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
    }

    public function getChatUuid(): string
    {
        return $this->chatUuid;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }
}
