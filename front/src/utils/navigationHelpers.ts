import { navigationItemOptions, navigationItemToFrenchTranslation, navigationItemToPath } from "~/models/enums/NavigationItem";
import type { NavigationItem } from "~/models/enums/NavigationItem";

/**
 * Derives the current NavigationItem from a pathname.
 * Uses exact match for the home path ("/") and startsWith for all others.
 */
export function getCurrentNavigationItem(pathname: string): NavigationItem | null {
    const match = navigationItemOptions.find((item) => {
        const path = navigationItemToPath[item];
        return path === "/" ? pathname === path : pathname.startsWith(path);
    });
    return match ?? null;
}

/**
 * Returns the French label of the current page based on the pathname.
 */
export function getCurrentPageLabel(pathname: string): string | null {
    const item = getCurrentNavigationItem(pathname);
    return item ? navigationItemToFrenchTranslation[item] : null;
}

/**
 * Checks whether a navigation item matches the current pathname.
 * Uses exact match for the home path ("/") and startsWith for all others.
 */
export function isNavigationItemSelected(item: NavigationItem, pathname: string): boolean {
    const path = navigationItemToPath[item];
    return path === "/" ? pathname === path : pathname.startsWith(path);
}
