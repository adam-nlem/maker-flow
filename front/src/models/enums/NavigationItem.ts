import type { ComponentType, SVGProps } from "react";
import { CalendarDaysIcon, ChartBarIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, DocumentDuplicateIcon, HomeIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarDaysIconSolid, ChartBarIcon as ChartBarIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, DocumentDuplicateIcon as DocumentDuplicateIconSolid, HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import { agencyHomePath, agencyScriptsPath, agencyCalendarPath, agencyDraftsPath, agencyContentsPath, agencyTasksPath, agencySettingsPath } from "~/routes/routePaths";

export enum NavigationItem {
    Home = 'home',
    Scripts = 'scripts',
    Calendar = 'calendar',
    Drafts = 'drafts',
    Contents = 'contents',
    Tasks = 'tasks',
    Settings = 'settings',
}

export const navigationItemOptions = Object.values(NavigationItem);

export const sidebarMainNavigationItems: NavigationItem[] = [
    NavigationItem.Home,
    NavigationItem.Scripts,
    NavigationItem.Calendar,
    NavigationItem.Drafts,
    NavigationItem.Contents,
];

export const sidebarBottomNavigationItems: NavigationItem[] = [
    NavigationItem.Settings,
];

export const navigationItemTranslationKeys: Record<NavigationItem, string> = {
    [NavigationItem.Home]: "navigation:items.home",
    [NavigationItem.Scripts]: "navigation:items.scripts",
    [NavigationItem.Calendar]: "navigation:items.calendar",
    [NavigationItem.Drafts]: "navigation:items.drafts",
    [NavigationItem.Contents]: "navigation:items.contents",
    [NavigationItem.Tasks]: "navigation:items.tasks",
    [NavigationItem.Settings]: "navigation:items.settings",
}

export const navigationItemToPath: Record<NavigationItem, string> = {
    [NavigationItem.Home]: agencyHomePath,
    [NavigationItem.Scripts]: agencyScriptsPath,
    [NavigationItem.Calendar]: agencyCalendarPath,
    [NavigationItem.Drafts]: agencyDraftsPath,
    [NavigationItem.Contents]: agencyContentsPath,
    [NavigationItem.Tasks]: agencyTasksPath,
    [NavigationItem.Settings]: agencySettingsPath,
}

export const navigationItemToIcon: Record<NavigationItem, ComponentType<SVGProps<SVGSVGElement>>> = {
    [NavigationItem.Home]: HomeIcon,
    [NavigationItem.Scripts]: ClipboardDocumentCheckIcon,
    [NavigationItem.Calendar]: CalendarDaysIcon,
    [NavigationItem.Drafts]: DocumentDuplicateIcon,
    [NavigationItem.Contents]: ChartBarIcon,
    [NavigationItem.Tasks]: ClipboardDocumentCheckIcon,
    [NavigationItem.Settings]: Cog6ToothIcon,
}

export const navigationItemToIconSolid: Record<NavigationItem, ComponentType<SVGProps<SVGSVGElement>>> = {
    [NavigationItem.Home]: HomeIconSolid,
    [NavigationItem.Scripts]: ClipboardDocumentCheckIconSolid,
    [NavigationItem.Calendar]: CalendarDaysIconSolid,
    [NavigationItem.Drafts]: DocumentDuplicateIconSolid,
    [NavigationItem.Contents]: ChartBarIconSolid,
    [NavigationItem.Tasks]: ClipboardDocumentCheckIconSolid,
    [NavigationItem.Settings]: Cog6ToothIconSolid,
}
