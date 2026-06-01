<?php

namespace App\Entity\Enum;

enum FileInvalidReason: string
{
    case MissingFile = 'missing_file';
    case TooManyFiles = 'too_many_files';
    case TooFewFiles = 'too_few_files';
    case FileTooLarge = 'file_too_large';
    case InvalidMimeType = 'invalid_mime_type';
    case InvalidPayload = 'invalid_payload';
}
