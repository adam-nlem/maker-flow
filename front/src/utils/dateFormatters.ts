import i18n from "~/services/i18n/i18n";
import { Language, languageToLocale } from "~/models/enums/Language";

function getCurrentLocale(): string {
    const language = (i18n.resolvedLanguage ?? i18n.language ?? Language.Fr) as Language;
    return languageToLocale[language] ?? languageToLocale[Language.Fr];
}

/**
 * Formats a date to French locale with abbreviated month: "01 janv. 2024"
 */
export function formatToFrenchDateShort(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

/**
 * Formats a date to French locale with full month name: "01 janvier 2024"
 */
export function formatToFrenchDateLong(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * Formats a date to numeric format: "01/01/2024"
 */
export function formatToNumericDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

/**
 * Formats a date relative to "now" in the user's active language.
 * Within a week: localized relative ("il y a 3 heures" / "3 hours ago").
 * Beyond a week: short date in the active locale ("24 janv." / "Jan 24").
 */
export function formatToRelative(date: Date): string {
    if (isNaN(date.getTime())) return '';

    const locale = getCurrentLocale();
    const diffInSec = Math.round((date.getTime() - Date.now()) / 1000);

    if (Math.abs(diffInSec) >= 604800) {
        return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(date);
    }

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 },
    ];
    const match = units.find(u => Math.abs(diffInSec) >= u.seconds) ?? units[units.length - 1];

    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
        .format(Math.round(diffInSec / match.seconds), match.unit);
}

export function formatToIso8601Tz(date: Date): string {
    return new Intl.DateTimeFormat('sv-SE').format(date);
}