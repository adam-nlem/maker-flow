<?php

namespace App\Helper;

class PasswordHelper
{
    const MIN_LENGTH = 8;
    const REGEX_UPPERCASE = '/[A-Z]/';
    const REGEX_LOWERCASE = '/[a-z]/';
    const REGEX_NUMBER = '/[0-9]/';
    const REGEX_SPECIAL = '/[^a-zA-Z0-9]/';

    /**
     * Validates a password against all strength rules.
     * Returns an array of error messages for each failing rule.
     * Returns an empty array if the password is valid.
     *
     * @param string $password
     * @return string[]
     */
    public static function validate(string $password): array
    {
        $errors = [];

        if (strlen($password) < self::MIN_LENGTH) {
            $errors[] = 'Password must be at least ' . self::MIN_LENGTH . ' characters long.';
        }

        if (!preg_match(self::REGEX_UPPERCASE, $password)) {
            $errors[] = 'Password must contain at least one uppercase letter.';
        }

        if (!preg_match(self::REGEX_LOWERCASE, $password)) {
            $errors[] = 'Password must contain at least one lowercase letter.';
        }

        if (!preg_match(self::REGEX_NUMBER, $password)) {
            $errors[] = 'Password must contain at least one number.';
        }

        if (!preg_match(self::REGEX_SPECIAL, $password)) {
            $errors[] = 'Password must contain at least one special character.';
        }

        return $errors;
    }

    /**
     * Checks if a password satisfies all validation rules.
     *
     * @param string $password
     * @return bool
     */
    public static function isValid(string $password): bool
    {
        return empty(self::validate($password));
    }
}
