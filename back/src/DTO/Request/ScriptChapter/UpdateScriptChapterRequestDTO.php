<?php

namespace App\DTO\Request\ScriptChapter;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ChapterType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptChapterRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    private ?string $description;
    private ?ChapterType $chapterType;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
        $this->description = $payload["description"] ?? null;
        $this->chapterType = isset($payload["chapterType"]) ? ChapterType::tryFrom($payload["chapterType"]) : null;
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'description' => $this->getDescription(),
            'chapterType' => $this->getChapterType(),
        ];
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getChapterType(): ?ChapterType
    {
        return $this->chapterType;
    }
}
