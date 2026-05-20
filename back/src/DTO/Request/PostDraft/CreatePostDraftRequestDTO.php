<?php

namespace App\DTO\Request\PostDraft;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\FileInvalidReason;
use App\Entity\Enum\MediaType;
use App\Entity\PostDraft;
use App\Exception\PostDraft\PostDraftFileInvalidException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreatePostDraftRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $title;
    private MediaType $mediaType;
    private ?string $description = null;
    private ?string $notes = null;
    private ?string $scriptUuid = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        $request = $requestStack->getCurrentRequest();
        $payload = $request !== null ? $request->request->all() : [];
        parent::__construct($requestStack, $validator, $payload);
    }

    protected function fromPayload(array $payload)
    {
        if (empty($payload["projectUuid"]) || empty($payload["title"]) || empty($payload["mediaType"])) {
            throw new PostDraftFileInvalidException(FileInvalidReason::InvalidPayload);
        }

        $mediaType = MediaType::tryFrom($payload["mediaType"]);

        if ($mediaType === null) {
            throw new PostDraftFileInvalidException(FileInvalidReason::InvalidPayload);
        }

        $this->projectUuid = $payload["projectUuid"];
        $this->title = $payload["title"];
        $this->mediaType = $mediaType;
        $this->description = !empty($payload["description"]) ? $payload["description"] : null;
        $this->notes = !empty($payload["notes"]) ? $payload["notes"] : null;
        $this->scriptUuid = !empty($payload["scriptUuid"]) ? $payload["scriptUuid"] : null;
    }

    protected function buildObject(): PostDraft
    {
        $postDraft = new PostDraft();
        $postDraft->setTitle($this->title);
        $postDraft->setDescription($this->description);
        $postDraft->setNotes($this->notes);
        $postDraft->setMediaType($this->mediaType);

        return $postDraft;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getMediaType(): MediaType
    {
        return $this->mediaType;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getScriptUuid(): ?string
    {
        return $this->scriptUuid;
    }
}
