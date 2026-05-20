<?php

namespace App\DTO\Request\PostDraft;

use App\DTO\Request\AbstractRequestDTO;
use App\Exception\PostDraft\PostDraftCommentEmptyException;
use App\Exception\PostDraft\PostDraftCommentPayloadInvalidException;
use App\Exception\PostDraft\PostDraftCommentTooLongException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RequestChangesOnPostDraftMediaVersionRequestDTO extends AbstractRequestDTO
{
    public const MAX_BODY_LENGTH = 5000;

    private string $comment;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        if (!array_key_exists('comment', $payload) || !is_string($payload['comment'])) {
            throw new PostDraftCommentPayloadInvalidException();
        }

        $comment = trim($payload['comment']);

        if ($comment === '') {
            throw new PostDraftCommentEmptyException();
        }

        if (mb_strlen($comment) > self::MAX_BODY_LENGTH) {
            throw new PostDraftCommentTooLongException();
        }

        $this->comment = $comment;
    }

    protected function buildObject(): array
    {
        return [
            'comment' => $this->comment,
        ];
    }

    public function getComment(): string
    {
        return $this->comment;
    }
}
