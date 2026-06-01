<?php

namespace App\DTO\Request\Review;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\FileInvalidReason;
use App\Entity\Enum\MediaType;
use App\Entity\Review;
use App\Exception\Review\ReviewFileInvalidException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateReviewRequestDTO extends AbstractRequestDTO
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
            throw new ReviewFileInvalidException(FileInvalidReason::InvalidPayload);
        }

        $mediaType = MediaType::tryFrom($payload["mediaType"]);

        if ($mediaType === null) {
            throw new ReviewFileInvalidException(FileInvalidReason::InvalidPayload);
        }

        $this->projectUuid = $payload["projectUuid"];
        $this->title = $payload["title"];
        $this->mediaType = $mediaType;
        $this->description = !empty($payload["description"]) ? $payload["description"] : null;
        $this->notes = !empty($payload["notes"]) ? $payload["notes"] : null;
        $this->scriptUuid = !empty($payload["scriptUuid"]) ? $payload["scriptUuid"] : null;
    }

    protected function buildObject(): Review
    {
        $review = new Review();
        $review->setTitle($this->title);
        $review->setDescription($this->description);
        $review->setNotes($this->notes);
        $review->setMediaType($this->mediaType);

        return $review;
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
