import type { ComponentType, SVGProps } from "react";
import { BuildingOffice2Icon, Cog6ToothIcon, CreditCardIcon, FolderIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { UserRole } from "./UserRole";

export enum SettingsSection {
    General = 'general',
    Agency = 'agency',
    Collaborators = 'collaborators',
    Projects = 'projects',
    Subscription = 'subscription',
}

export const settingsSectionOptions = Object.values(SettingsSection);

export const settingsSectionTranslationKeys: Record<SettingsSection, string> = {
    [SettingsSection.General]: "settings:sections.general",
    [SettingsSection.Agency]: "settings:sections.agency",
    [SettingsSection.Collaborators]: "settings:sections.collaborators",
    [SettingsSection.Projects]: "settings:sections.projects",
    [SettingsSection.Subscription]: "settings:sections.subscription",
}

export const settingsSectionToIcon: Record<SettingsSection, ComponentType<SVGProps<SVGSVGElement>>> = {
    [SettingsSection.General]: Cog6ToothIcon,
    [SettingsSection.Agency]: BuildingOffice2Icon,
    [SettingsSection.Collaborators]: UserGroupIcon,
    [SettingsSection.Projects]: FolderIcon,
    [SettingsSection.Subscription]: CreditCardIcon,
}

export const settingsSectionToPath: Record<SettingsSection, string> = {
    [SettingsSection.General]: "general",
    [SettingsSection.Agency]: "agency",
    [SettingsSection.Collaborators]: "collaborators",
    [SettingsSection.Projects]: "projects",
    [SettingsSection.Subscription]: "subscription",
}

export function getSettingsSectionsForRoles(roles: UserRole[]): SettingsSection[] {
    if (roles.includes(UserRole.Admin)) {
        return [
            SettingsSection.General,
            SettingsSection.Agency,
            SettingsSection.Collaborators,
            SettingsSection.Projects,
            SettingsSection.Subscription,
        ];
    }

    if (roles.includes(UserRole.Editor) || roles.includes(UserRole.Viewer)) {
        return [SettingsSection.General, SettingsSection.Projects];
    }

    if (roles.includes(UserRole.Client)) {
        return [SettingsSection.General];
    }

    return [];
}
