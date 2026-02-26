<?php

namespace App\Entity\Enum;

enum OpeningStyle: string
{
    case BoldHook = 'bold_hook';
    case ShockingStat = 'shocking_stat';
    case PersonalStory = 'personal_story';
    case RelatableQuestion = 'relatable_question';
    case JumpIntoContent = 'jump_into_content';
    case SurpriseMe = 'surprise_me';
}
