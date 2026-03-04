<?php

namespace App\Service\ScriptGeneration;

use App\Entity\ScriptGeneration;
use App\Repository\ScriptCallToActionRepository;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptHookRepository;
use App\Repository\ScriptRetentionCueRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;

class ScriptGenerationService
{
    public function __construct(
        private readonly ScriptHookRepository $scriptHookRepository,
        private readonly ScriptChapterRepository $scriptChapterRepository,
        private readonly ScriptVoiceOverRepository $scriptVoiceOverRepository,
        private readonly ScriptShotRepository $scriptShotRepository,
        private readonly ScriptCallToActionRepository $scriptCallToActionRepository,
        private readonly ScriptRetentionCueRepository $scriptRetentionCueRepository,
        private readonly ScriptTextRepository $scriptTextRepository,
        private readonly ScriptDialogueRepository $scriptDialogueRepository,
    ) {
    }

    public function deletePartsByGeneration(ScriptGeneration $generation): void
    {
        $this->scriptHookRepository->deleteByGeneration($generation);
        $this->scriptChapterRepository->deleteByGeneration($generation);
        $this->scriptVoiceOverRepository->deleteByGeneration($generation);
        $this->scriptShotRepository->deleteByGeneration($generation);
        $this->scriptCallToActionRepository->deleteByGeneration($generation);
        $this->scriptRetentionCueRepository->deleteByGeneration($generation);
        $this->scriptTextRepository->deleteByGeneration($generation);
        $this->scriptDialogueRepository->deleteByGeneration($generation);
    }
}
