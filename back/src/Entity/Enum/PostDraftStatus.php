<?php

namespace App\Entity\Enum;

enum PostDraftStatus: string
{
    case AwaitingReview = 'awaiting_review';
    case ChangesRequested = 'changes_requested';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
