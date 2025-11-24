<?php

namespace App\Helper;

use DateTimeZone;

class DateHelper
{
    /**
     * ISO 8601 is a universal standard for exchanging date and time data.
     * FORMAT_ISO8601_NO_TZ denotes the format without appending the timezone.
     * /!\ It's potential that the datetime could be time-zoned, which should be managed separately.
     * For instance, 2024-02-10T08:00:00 is a valid format without timezone.
     */
    const FORMAT_ISO8601_NO_TZ = 'Y-m-d\TH:i:s';

    const FORMAT_ISO8601_TZ = 'Y-m-d\TH:i:sP';

    public static function createUtcDateTimeImmutable(string $datetime = 'now'): \DateTimeImmutable
    {
        return new \DateTimeImmutable($datetime, new \DateTimeZone('UTC'));
    }

    /**
     * Convert a datetime from a given timezone to UTC
     * @param string $dateTimeWithTZ 
     * @param DateTimeZone $userTimeZone 
     * @return string 
     */
    public static function convertToUTCFromTZ(string $dateTimeWithTZ, \DateTimeZone $userTimeZone): string
    {
        // Create a DateTime object with the specified datetime and timezone
        $date = new \DateTime($dateTimeWithTZ, $userTimeZone);

        // Change the timezone of the DateTime object to UTC
        $date->setTimezone(new \DateTimeZone('UTC'));
        // Return the datetime in UTC in the format 'Y-m-d\TH:i:s'
        return $date->format(self::FORMAT_ISO8601_NO_TZ);
    }

    /**
     * Convert a datetime from UTC to a given timezone
     * @param \DateTimeImmutable $dateTimeUTC The datetime string in UTC
     * @param \DateTimeZone $userTimeZone The user's timezone
     * @return string The datetime string in the user's timezone
     */
    public static function convertToTZFromUTC(\DateTimeImmutable $dateTimeUTC, \DateTimeZone $userTimeZone): string
    {
        // Create a DateTime object with given datetime in UTC
        $date = new \DateTime($dateTimeUTC->format(self::FORMAT_ISO8601_NO_TZ), new \DateTimeZone('UTC'));
        // Change the timezone of the DateTime object to the given timezone
        $date->setTimezone($userTimeZone);
        // Return the datetime in the given timezone in the format 'Y-m-d\TH:i:sP'
        return $date->format(self::FORMAT_ISO8601_TZ);
    }
}
