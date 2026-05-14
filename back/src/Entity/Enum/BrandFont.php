<?php

namespace App\Entity\Enum;

// Curated whitelist of Google Fonts an agency can pick for its heading/body
// typography. The string value is used both as the storage value and as the
// CSS font-family name the frontend resolves to a full stack.
enum BrandFont: string
{
    case Inter = 'Inter';
    case Roboto = 'Roboto';
    case OpenSans = 'Open Sans';
    case Lato = 'Lato';
    case Montserrat = 'Montserrat';
    case Poppins = 'Poppins';
    case Outfit = 'Outfit';
    case Nunito = 'Nunito';

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
