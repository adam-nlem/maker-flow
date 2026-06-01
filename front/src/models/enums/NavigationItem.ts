import type { ComponentType, SVGProps } from "react";
import { CalendarDaysIcon, ChartBarIcon, ClipboardDocumentCheckIcon, DocumentDuplicateIcon, HomeIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarDaysIconSolid, ChartBarIcon as ChartBarIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid, DocumentDuplicateIcon as DocumentDuplicateIconSolid, HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import {
    agencyHomePath,
    agencyScriptsPath,
    agencyCalendarPath,
    agencyReviewsPath,
    agencyContentsPath,
    agencyTasksPath,
    clientHomePath,
    clientReviewsPath,
    clientContentsPath,
} from "~/routes/routePaths";

export enum NavigationItem {
    Home = 'home',
    Scripts = 'scripts',
    Calendar = 'calendar',
    Reviews = 'reviews',
    Contents = 'contents',
    Tasks = 'tasks',
}

export const navigationItemOptions = Object.values(NavigationItem);

export const sidebarMainNavigationItems: NavigationItem[] = [
    NavigationItem.Home,
    NavigationItem.Scripts,
    NavigationItem.Calendar,
    NavigationItem.Reviews,
    NavigationItem.Contents,
];

export const clientSidebarNavigationItems: { item: NavigationItem; path: string }[] = [
    { item: NavigationItem.Home, path: clientHomePath },
    { item: NavigationItem.Reviews, path: clientReviewsPath },
    { item: NavigationItem.Contents, path: clientContentsPath },
];

export const navigationItemTranslationKeys: Record<NavigationItem, string> = {
    [NavigationItem.Home]: "navigation:items.home",
    [NavigationItem.Scripts]: "navigation:items.scripts",
    [NavigationItem.Calendar]: "navigation:items.calendar",
    [NavigationItem.Reviews]: "navigation:items.reviews",
    [NavigationItem.Contents]: "navigation:items.contents",
    [NavigationItem.Tasks]: "navigation:items.tasks",
}

export const navigationItemToPath: Record<NavigationItem, string> = {
    [NavigationItem.Home]: agencyHomePath,
    [NavigationItem.Scripts]: agencyScriptsPath,
    [NavigationItem.Calendar]: agencyCalendarPath,
    [NavigationItem.Reviews]: agencyReviewsPath,
    [NavigationItem.Contents]: agencyContentsPath,
    [NavigationItem.Tasks]: agencyTasksPath,
}

export const navigationItemToIcon: Record<NavigationItem, ComponentType<SVGProps<SVGSVGElement>>> = {
    [NavigationItem.Home]: HomeIcon,
    [NavigationItem.Scripts]: ClipboardDocumentCheckIcon,
    [NavigationItem.Calendar]: CalendarDaysIcon,
    [NavigationItem.Reviews]: DocumentDuplicateIcon,
    [NavigationItem.Contents]: ChartBarIcon,
    [NavigationItem.Tasks]: ClipboardDocumentCheckIcon,
}

export const navigationItemToIconSolid: Record<NavigationItem, ComponentType<SVGProps<SVGSVGElement>>> = {
    [NavigationItem.Home]: HomeIconSolid,
    [NavigationItem.Scripts]: ClipboardDocumentCheckIconSolid,
    [NavigationItem.Calendar]: CalendarDaysIconSolid,
    [NavigationItem.Reviews]: DocumentDuplicateIconSolid,
    [NavigationItem.Contents]: ChartBarIconSolid,
    [NavigationItem.Tasks]: ClipboardDocumentCheckIconSolid,
}
