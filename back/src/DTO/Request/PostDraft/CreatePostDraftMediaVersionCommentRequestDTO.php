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

    #[Assert\NotBlank]
    #[Assert\Length(max: 5000)]
    private string $body;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->mediaVersionUuid = (string) ($payload["mediaVersionUuid"] ?? '');
        $this->body = trim((string) ($payload["body"] ?? ''));
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
}
