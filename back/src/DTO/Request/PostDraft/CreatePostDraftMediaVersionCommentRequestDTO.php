<?php

namespace App\DTO\Request\PostDraft;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\PostDraftMediaVersionComment;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreatePostDraftMediaVersionCommentRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $mediaVersionUuid;

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
        $this->mediaVersionUuid = $payload['mediaVersionUuid'];
        $this->body = trim($payload['body']);
        $this->parentCommentUuid = $payload['parentCommentUuid'] ?? null;
        $this->videoTimecodeSeconds = $payload['videoTimecodeSeconds'] ?? null;
    }

    protected function buildObject(): PostDraftMediaVersionComment
    {
        return (new PostDraftMediaVersionComment())
            ->setBody($this->getBody());
    }

    public function getMediaVersionUuid(): string
    {
        return $this->mediaVersionUuid;
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
