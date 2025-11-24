<?php


namespace App\Helper;


class RegexHelper
{
    public static function isValidPhoneNumber(string $phoneNumber)
    {
        $matches = [];
        preg_match('/^(\+33|0)[0-9]{9}$/', $phoneNumber, $matches);

        return (!empty($matches));
    }
}