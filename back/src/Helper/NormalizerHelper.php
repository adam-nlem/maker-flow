<?php


namespace App\Helper;


class NormalizerHelper
{
    /**
     * Normalize the given phone number to a consistent format.
     * Basically, it takes a 10-digits phone number and adds the french indicative prefix (+33)
     * Note: the provided value must have been validated before.
     *
     * @param string $phoneNumber
     * @return string
     */
    public static function normalizeFrenchPhoneNumber(string $phoneNumber): string
    {
        if (substr($phoneNumber, 0, 3) !== '+33') {
            return '+33' . substr($phoneNumber, 1);
        } else {
            return $phoneNumber;
        }
    }
}