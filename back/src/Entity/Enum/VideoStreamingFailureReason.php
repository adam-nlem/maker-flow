<?php

namespace App\Entity\Enum;

enum VideoStreamingFailureReason: string
{
    case InvalidSource = 'invalid_source';
    case ProcessingError = 'processing_error';
}
