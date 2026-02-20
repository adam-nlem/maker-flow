<?php

namespace App\DTO\Request\ScriptTag;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Color;
use App\Entity\ScriptTag;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptTagRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $title;
    private Color $color;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->title = $payload["title"];
        $this->color = Color::tryFrom($payload["color"] ?? "") ?? Color::Green;
    }

    protected function buildObject(): ScriptTag
    {
        $tag = new ScriptTag();

        return $tag
            ->setTitle($this->getTitle())
            ->setColor($this->getColor());
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getColor(): Color
    {
        return $this->color;
    }
}
