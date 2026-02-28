import type { ComponentType, SVGProps } from "react";
import { Cog6ToothIcon, FolderIcon, GlobeAltIcon, UserCircleIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export enum SettingsSection {
    General = 'general',
    Project = 'project',
    Integration = 'integration',
    CreatorProfile = 'creator_profile',
    Subscription = 'subscription',
}

export const settingsSectionOptions = Object.values(SettingsSection);

export const settingsSectionToFrenchTranslation: Record<SettingsSection, string> = {
    [SettingsSection.General]: "Général",
    [SettingsSection.Project]: "Projet",
    [SettingsSection.Integration]: "Réseaux sociaux",
    [SettingsSection.CreatorProfile]: "Profil créateur",
    [SettingsSection.Subscription]: "Abonnement",
}

export const settingsSectionToIcon: Record<SettingsSection, ComponentType<SVGProps<SVGSVGElement>>> = {
    [SettingsSection.General]: Cog6ToothIcon,
    [SettingsSection.Project]: FolderIcon,
    [SettingsSection.Integration]: GlobeAltIcon,
    [SettingsSection.CreatorProfile]: UserCircleIcon,
    [SettingsSection.Subscription]: CreditCardIcon,
}
