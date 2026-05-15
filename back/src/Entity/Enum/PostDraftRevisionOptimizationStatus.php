<?php

namespace App\Entity\Enum;

enum PostDraftRevisionOptimizationStatus: string
{
    case Pending = 'pending';
    case Optimizing = 'optimizing';
    case Optimized = 'optimized';
    case Failed = 'failed';
}
