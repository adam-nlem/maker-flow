<?php

namespace App\Service\AiClient;

use App\Entity\Enum\AiModel;
use App\Service\GeminiClient\GeminiClientService;

class AiClientResolver
{
    public function __construct(
        private readonly GeminiClientService $gemini,
        private readonly OpenAiClientService $openAi,
        private readonly ClaudeClientService $claude,
    ) {
    }

    public function resolve(AiModel $model): AiClientInterface
    {
        return match ($model) {
            AiModel::Gemini  => $this->gemini,
            AiModel::ChatGpt => $this->openAi,
            AiModel::Claude  => $this->claude,
        };
    }
}
