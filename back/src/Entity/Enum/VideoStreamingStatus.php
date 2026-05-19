<?php

namespace App\Entity\Enum;

enum VideoStreamingStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';
}
