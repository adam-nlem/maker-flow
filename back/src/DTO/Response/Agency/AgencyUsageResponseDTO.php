<?php

namespace App\DTO\Response\Agency;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class AgencyUsageResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_agencies_usage'])]
        private int $editorCollaboratorsUsed,
        #[Groups(['api_agencies_usage'])]
        private ?int $editorCollaboratorsLimit,
        #[Groups(['api_agencies_usage'])]
        private int $videoSecondsUsed,
        #[Groups(['api_agencies_usage'])]
        private ?int $videoSecondsLimit,
        #[Groups(['api_agencies_usage'])]
        private int $storageBytesUsed,
        #[Groups(['api_agencies_usage'])]
        private ?int $storageBytesLimit,
    ) {}

    public function getData(): array
    {
        return [
            'editorCollaboratorsUsed' => $this->editorCollaboratorsUsed,
            'editorCollaboratorsLimit' => $this->editorCollaboratorsLimit,
            'videoSecondsUsed' => $this->videoSecondsUsed,
            'videoSecondsLimit' => $this->videoSecondsLimit,
            'storageBytesUsed' => $this->storageBytesUsed,
            'storageBytesLimit' => $this->storageBytesLimit,
        ];
    }

    public function getEditorCollaboratorsUsed(): int
    {
        return $this->editorCollaboratorsUsed;
    }

    public function getEditorCollaboratorsLimit(): ?int
    {
        return $this->editorCollaboratorsLimit;
    }

    public function getVideoSecondsUsed(): int
    {
        return $this->videoSecondsUsed;
    }

    public function getVideoSecondsLimit(): ?int
    {
        return $this->videoSecondsLimit;
    }

    public function getStorageBytesUsed(): int
    {
        return $this->storageBytesUsed;
    }

    public function getStorageBytesLimit(): ?int
    {
        return $this->storageBytesLimit;
    }
}
