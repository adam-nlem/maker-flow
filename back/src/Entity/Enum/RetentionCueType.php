<?php

namespace App\Entity\Enum;

enum RetentionCueType: string
{
    case Question = 'question';
    case Teaser = 'teaser';
    case PatternBreak = 'pattern_break';
    case Cliffhanger = 'cliffhanger';
}
