import type { ComponentType, SVGProps } from "react";
import { Cog6ToothIcon, FolderIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export enum SettingsSection {
    General = 'general',
    Projects = 'projects',
    Subscription = 'subscription',
}

export const settingsSectionOptions = Object.values(SettingsSection);

export const settingsSectionTranslationKeys: Record<SettingsSection, string> = {
    [SettingsSection.General]: "settings:sections.general",
    [SettingsSection.Projects]: "settings:sections.projects",
    [SettingsSection.Subscription]: "settings:sections.subscription",
}

export const settingsSectionToIcon: Record<SettingsSection, ComponentType<SVGProps<SVGSVGElement>>> = {
    [SettingsSection.General]: Cog6ToothIcon,
    [SettingsSection.Projects]: FolderIcon,
    [SettingsSection.Subscription]: CreditCardIcon,
}

export const settingsSectionToPath: Record<SettingsSection, string> = {
    [SettingsSection.General]: "general",
    [SettingsSection.Projects]: "projects",
    [SettingsSection.Subscription]: "subscription",
}
