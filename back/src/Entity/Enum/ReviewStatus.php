<?php

namespace App\Entity\Enum;

enum ReviewStatus: string
{
    case Pending = 'pending';
    case ChangesRequested = 'changes_requested';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
