<?php

namespace App\DTO\QueryParam\PostDraft;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StreamFileQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $mediaVersionUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $index;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->mediaVersionUuid = (string) ($queryParams["mediaVersionUuid"] ?? "");
        $this->index = (int) ($queryParams["index"] ?? 0);
    }

    public function getMediaVersionUuid(): string
    {
        return $this->mediaVersionUuid;
    }

    public function getIndex(): int
    {
        return $this->index;
    }
}
