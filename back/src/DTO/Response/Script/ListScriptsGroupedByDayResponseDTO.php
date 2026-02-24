<?php

namespace App\DTO\Response\Script;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class ListScriptsGroupedByDayResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups([
            'api_scripts_calendar'
        ])]
        private readonly string $date,
        /** @var \App\Entity\Script[] $scripts */
        #[Groups([
            'api_scripts_calendar'
        ])]
        private readonly array $scripts,
    ) {}

    public function getData(): array
    {
        return [
            'date' => $this->date,
            'scripts' => $this->scripts,
        ];
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function getScripts(): array
    {
        return $this->scripts;
    }
}
