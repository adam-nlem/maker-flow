import { NavigationItem, navigationItemOptions, navigationItemTranslationKeys, navigationItemToPath } from "~/models/enums/NavigationItem";

/**
 * Derives the current NavigationItem from a pathname.
 * Uses exact match for Home and startsWith for all others.
 */
export function getCurrentNavigationItem(pathname: string): NavigationItem | null {
    const match = navigationItemOptions.find((item) => isNavigationItemSelected(item, pathname));
    return match ?? null;
}

/**
 * Returns the i18n translation key of the current page based on the pathname.
 * Callers must run it through `t()` to get the localized label.
 */
export function getCurrentPageLabelKey(pathname: string): string | null {
    const item = getCurrentNavigationItem(pathname);
    return item ? navigationItemTranslationKeys[item] : null;
}

/**
 * Checks whether a navigation item matches the current pathname.
 * Home is matched exactly so that nested agency routes (e.g. /agency/tasks)
 * don't keep Home selected; all other items use startsWith.
 */
export function isNavigationItemSelected(item: NavigationItem, pathname: string): boolean {
    const path = navigationItemToPath[item];
    return item === NavigationItem.Home ? pathname === path : pathname.startsWith(path);
}
