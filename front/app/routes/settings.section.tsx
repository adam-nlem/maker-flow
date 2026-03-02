import type { ComponentType } from "react";
import { Navigate, useParams } from "react-router";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import GeneralSettings from "~/components/settings/GeneralSettings";
import ProjectSettings from "~/components/settings/ProjectSettings";
import IntegrationSettings from "~/components/settings/IntegrationSettings";
import CreatorProfileSettings from "~/components/settings/CreatorProfileSettings";
import SubscriptionSettings from "~/components/settings/SubscriptionSettings";

function CreatorProfileSettingsWrapper() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    if (!focusedProject) return null;

    return <CreatorProfileSettings projectUuid={focusedProject.uuid} />;
}

const sectionComponents: Record<string, ComponentType> = {
    "general": GeneralSettings,
    "project": ProjectSettings,
    "integration": IntegrationSettings,
    "creator-profile": CreatorProfileSettingsWrapper,
    "subscription": SubscriptionSettings,
};

export default function SettingsSectionRoute() {
    const { section } = useParams();

    if (!section) return <Navigate to="/settings/general" replace />;

    const Component = sectionComponents[section];

    if (!Component) return <Navigate to="/settings/general" replace />;

    return <Component />;
}
