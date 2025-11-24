<?php

namespace App\Helper;

use App\Entity\Token;
use App\Repository\TokenRepository;
use Symfony\Component\HttpFoundation\Request;

class HeaderHelper
{
    const HEADER_TIMEZONE = 'X-Timezone';

    static function hasTimezone(Request $request): bool
    {
        return $request->headers->has(self::HEADER_TIMEZONE);
    }

    static function getTimezone(Request $request): \DateTimezone
    {
        return new \DateTimezone($request->headers->get(self::HEADER_TIMEZONE));
    }
}
