<?php

namespace App\DTO\Request\ScriptTag;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Color;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptTagRequestDTO extends AbstractRequestDTO
{
    private string $title;
    private Color $color;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->title = $payload["title"];
        $this->color = Color::tryFrom($payload["color"] ?? "") ?? Color::Green;
    }

    public function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'color' => $this->getColor(),
        ];
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
