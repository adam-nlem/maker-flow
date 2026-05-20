<?php

namespace App\DTO\Request\Review;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\ReviewComment;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateReviewCommentRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $reviewVersionUuid;

    #[Assert\NotBlank(normalizer: 'trim')]
    #[Assert\Length(max: 5000)]
    private string $body;

    #[Assert\Uuid]
    private ?string $parentCommentUuid = null;

    #[Assert\PositiveOrZero]
    private ?float $videoTimecodeSeconds = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->reviewVersionUuid = $payload['reviewVersionUuid'];
        $this->body = trim($payload['body']);
        $this->parentCommentUuid = $payload['parentCommentUuid'] ?? null;
        $this->videoTimecodeSeconds = $payload['videoTimecodeSeconds'] ?? null;
    }

    protected function buildObject(): ReviewComment
    {
        return (new ReviewComment())
            ->setBody($this->getBody());
    }

    public function getReviewVersionUuid(): string
    {
        return $this->reviewVersionUuid;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getParentCommentUuid(): ?string
    {
        return $this->parentCommentUuid;
    }

    public function getVideoTimecodeSeconds(): ?float
    {
        return $this->videoTimecodeSeconds;
    }
}
