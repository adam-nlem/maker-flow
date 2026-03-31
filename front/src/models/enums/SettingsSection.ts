import type { ComponentType, SVGProps } from "react";
import { Cog6ToothIcon, FolderIcon, UserCircleIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export enum SettingsSection {
    General = 'general',
    Projects = 'projects',
    CreatorProfile = 'creator_profile',
    Subscription = 'subscription',
}

export const settingsSectionOptions = Object.values(SettingsSection);

export const settingsSectionToFrenchTranslation: Record<SettingsSection, string> = {
    [SettingsSection.General]: "Général",
    [SettingsSection.Projects]: "Projets",
    [SettingsSection.CreatorProfile]: "Profil créateur",
    [SettingsSection.Subscription]: "Abonnement",
}

export const settingsSectionToIcon: Record<SettingsSection, ComponentType<SVGProps<SVGSVGElement>>> = {
    [SettingsSection.General]: Cog6ToothIcon,
    [SettingsSection.Projects]: FolderIcon,
    [SettingsSection.CreatorProfile]: UserCircleIcon,
    [SettingsSection.Subscription]: CreditCardIcon,
}

export const settingsSectionToPath: Record<SettingsSection, string> = {
    [SettingsSection.General]: "general",
    [SettingsSection.Projects]: "projects",
    [SettingsSection.CreatorProfile]: "creator-profile",
    [SettingsSection.Subscription]: "subscription",
}
