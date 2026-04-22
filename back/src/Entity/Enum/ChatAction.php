<?php

namespace App\Entity\Enum;

enum ChatAction: string
{
    case GenerateScript = 'generate_script';
    case AnalyzeScript = 'analyze_script';
    case ImproveHook = 'improve_hook';
    case FreeChat = 'free_chat';
}
