import { NavigationItem, navigationItemOptions, navigationItemTranslationKeys, navigationItemToPath } from "~/models/enums/NavigationItem";
import { SettingsSection, settingsSectionTranslationKeys } from "~/models/enums/SettingsSection";
import { agencySettingsPath, clientSettingsPath } from "~/routes/routePaths";

/**
 * Derives the current NavigationItem from a pathname.
 * Uses exact match for Home and startsWith for all others.
 */
export function getCurrentNavigationItem(pathname: string): NavigationItem | null {
    const match = navigationItemOptions.find((item) => isNavigationItemSelected(item, pathname));
    return match ?? null;
}

/**
 * Returns the ordered list of i18n keys to display in the top-bar breadcrumb for
 * the current pathname. Most routes resolve to a single key (the nav item label);
 * settings sub-routes resolve to two keys (Settings + the active section).
 * Callers must run each key through `t()` to get the localized label.
 */
export function getCurrentBreadcrumbKeys(pathname: string): string[] {
    const settingsKeys = getSettingsBreadcrumbKeys(pathname, agencySettingsPath)
        ?? getSettingsBreadcrumbKeys(pathname, clientSettingsPath);
    if (settingsKeys) return settingsKeys;

    const item = getCurrentNavigationItem(pathname);
    return item ? [navigationItemTranslationKeys[item]] : [];
}

function getSettingsBreadcrumbKeys(pathname: string, basePath: string): string[] | null {
    if (pathname !== basePath && !pathname.startsWith(basePath + "/")) return null;

    const keys: string[] = ["navigation:items.settings"];
    const section = pathname.slice(basePath.length).replace(/^\//, "").split("/")[0] as SettingsSection;
    if (section && settingsSectionTranslationKeys[section]) {
        keys.push(settingsSectionTranslationKeys[section]);
    }
    return keys;
}

/**
 * Checks whether a navigation item matches the current pathname.
 * Home is matched exactly so that nested area routes (e.g. /agency/tasks)
 * don't keep Home selected; all other items use startsWith.
 */
export function isPathSelected(item: NavigationItem, path: string, pathname: string): boolean {
    return item === NavigationItem.Home ? pathname === path : pathname.startsWith(path);
}

/** Convenience overload for callers using the agency `navigationItemToPath` map. */
export function isNavigationItemSelected(item: NavigationItem, pathname: string): boolean {
    return isPathSelected(item, navigationItemToPath[item], pathname);
}
