<?php

namespace App\DTO\Request\ScriptChapter;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ChapterType;
use App\Entity\ScriptChapter;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptChapterRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $title;
    private ?string $description;
    private ChapterType $chapterType;
    private ?int $position;
    private ?string $generationUuid = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload["scriptUuid"];
        $this->title = $payload["title"];
        $this->description = $payload["description"] ?? null;
        $this->chapterType = ChapterType::tryFrom($payload["chapterType"] ?? "") ?? ChapterType::OnScreen;
        $this->position = $payload["position"] ?? null;
        $this->generationUuid = $payload["generationUuid"] ?? null;
    }

    protected function buildObject(): ScriptChapter
    {
        $chapter = new ScriptChapter();

        $chapter
            ->setTitle($this->getTitle())
            ->setChapterType($this->getChapterType());

        if ($this->getDescription() !== null) {
            $chapter->setDescription($this->getDescription());
        }

        return $chapter;
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getChapterType(): ChapterType
    {
        return $this->chapterType;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function getGenerationUuid(): ?string
    {
        return $this->generationUuid;
    }
}
