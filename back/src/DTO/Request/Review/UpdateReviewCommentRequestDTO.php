<?php

namespace App\DTO\Request\Review;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ReviewCommentStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateReviewCommentRequestDTO extends AbstractRequestDTO
{
    #[Assert\Length(max: 5000)]
    private ?string $body = null;

    private ?ReviewCommentStatus $status = null;

    #[Assert\PositiveOrZero]
    private ?float $videoTimecodeSeconds = null;

    private array $presentFields = [];

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        if (array_key_exists('body', $payload)) {
            $this->body = is_string($payload['body']) ? trim($payload['body']) : $payload['body'];
            $this->presentFields['body'] = true;
        }

        if (array_key_exists('status', $payload)) {
            $this->status = ReviewCommentStatus::tryFrom($payload['status'] ?? '');
            $this->presentFields['status'] = true;
        }

        if (array_key_exists('videoTimecodeSeconds', $payload)) {
            $this->videoTimecodeSeconds = $payload['videoTimecodeSeconds'];
            $this->presentFields['videoTimecodeSeconds'] = true;
        }
    }

    protected function buildObject(): array
    {
        return [
            'body' => $this->getBody(),
            'status' => $this->getStatus(),
            'videoTimecodeSeconds' => $this->getVideoTimecodeSeconds(),
        ];
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function getStatus(): ?ReviewCommentStatus
    {
        return $this->status;
    }

    public function getVideoTimecodeSeconds(): ?float
    {
        return $this->videoTimecodeSeconds;
    }

    public function hasBody(): bool
    {
        return isset($this->presentFields['body']);
    }

    public function hasStatus(): bool
    {
        return isset($this->presentFields['status']);
    }

    public function hasVideoTimecodeSeconds(): bool
    {
        return isset($this->presentFields['videoTimecodeSeconds']);
    }
}
