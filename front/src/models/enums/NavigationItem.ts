import type { ComponentType, SVGProps } from "react";
import { CalendarDaysIcon, ChartBarIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, HomeIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarDaysIconSolid, ChartBarIcon as ChartBarIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import { homePath, scriptsPath, calendarPath, contentsPath, tasksPath, settingsPath } from "~/routes/routePaths";

export enum NavigationItem {
    Home = 'home',
    Scripts = 'scripts',
    Calendar = 'calendar',
    Contents = 'contents',
    Tasks = 'tasks',
    Settings = 'settings',
}

export const navigationItemOptions = Object.values(NavigationItem);

export const sidebarMainNavigationItems: NavigationItem[] = [
    NavigationItem.Home,
    NavigationItem.Scripts,
    NavigationItem.Calendar,
    NavigationItem.Contents,
];

export const sidebarBottomNavigationItems: NavigationItem[] = [
    NavigationItem.Settings,
];

export const navigationItemToFrenchTranslation: Record<NavigationItem, string> = {
    [NavigationItem.Home]: "Accueil",
    [NavigationItem.Scripts]: "Script",
    [NavigationItem.Calendar]: "Calendrier",
    [NavigationItem.Contents]: "Contenu",
    [NavigationItem.Tasks]: "Tâches",
    [NavigationItem.Settings]: "Paramètres",
}

export const navigationItemToPath: Record<NavigationItem, string> = {
    [NavigationItem.Home]: homePath,
    [NavigationItem.Scripts]: scriptsPath,
    [NavigationItem.Calendar]: calendarPath,
    [NavigationItem.Contents]: contentsPath,
    [NavigationItem.Tasks]: tasksPath,
    [NavigationItem.Settings]: settingsPath,
}

export const navigationItemToIcon: Record<NavigationItem, ComponentType<SVGProps<SVGSVGElement>>> = {
    [NavigationItem.Home]: HomeIcon,
    [NavigationItem.Scripts]: ClipboardDocumentCheckIcon,
    [NavigationItem.Calendar]: CalendarDaysIcon,
    [NavigationItem.Contents]: ChartBarIcon,
    [NavigationItem.Tasks]: ClipboardDocumentCheckIcon,
    [NavigationItem.Settings]: Cog6ToothIcon,
}

export const navigationItemToIconSolid: Record<NavigationItem, ComponentType<SVGProps<SVGSVGElement>>> = {
    [NavigationItem.Home]: HomeIconSolid,
    [NavigationItem.Scripts]: ClipboardDocumentCheckIconSolid,
    [NavigationItem.Calendar]: CalendarDaysIconSolid,
    [NavigationItem.Contents]: ChartBarIconSolid,
    [NavigationItem.Tasks]: ClipboardDocumentCheckIconSolid,
    [NavigationItem.Settings]: Cog6ToothIconSolid,
}
