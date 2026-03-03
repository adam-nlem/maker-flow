<?php

namespace App\Service\AiClient;

interface AiClientInterface
{
    public function generateScript(string $prompt): string;
}
