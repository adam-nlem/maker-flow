import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import GeneralSettings from "~/components/settings/GeneralSettings";
import ProjectSettings from "~/components/settings/ProjectSettings";
import IntegrationSettings from "~/components/settings/IntegrationSettings";
import CreatorProfileSettings from "~/components/settings/CreatorProfileSettings";
import SubscriptionSettings from "~/components/settings/SubscriptionSettings";

export default function SettingsSectionRoute() {
    const { section } = useParams();
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    if (!section) return <Navigate to="/settings/general" replace />;
    if (!focusedProject) return null;

    const sectionNodes: Record<string, ReactNode> = {
        "general": <GeneralSettings />,
        "project": <ProjectSettings />,
        "integration": <IntegrationSettings projectUuid={focusedProject.uuid} />,
        "creator-profile": <CreatorProfileSettings projectUuid={focusedProject.uuid} />,
        "subscription": <SubscriptionSettings />,
    };

    const node = sectionNodes[section];
    if (!node) return <Navigate to="/settings/general" replace />;
    return node;
}
