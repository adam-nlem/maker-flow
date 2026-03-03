<?php

namespace App\Entity\Enum;

enum AiModel: string
{
    case Gemini = 'gemini';
    case ChatGpt = 'chat_gpt';
    case Claude = 'claude';
}
