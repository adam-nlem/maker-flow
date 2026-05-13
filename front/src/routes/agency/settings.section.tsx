import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { agencySettingsGeneralPath } from "~/routes/routePaths";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { SettingsSection, getSettingsSectionsForRoles, settingsSectionToPath } from "~/models/enums/SettingsSection";
import GeneralSettings from "~/components/settings/GeneralSettings";
import AgencySettings from "~/components/settings/agency/AgencySettings";
import ProjectsSettings from "~/components/settings/ProjectsSettings";
import SubscriptionSettings from "~/components/settings/SubscriptionSettings";

export default function AgencySettingsSectionRoute() {
    const { section } = useParams();
    const { user } = useCurrentUser();
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    if (!section) return <Navigate to={agencySettingsGeneralPath} replace />;

    const visibleSections = getSettingsSectionsForRoles(user?.roles ?? []);
    const matchedSection = visibleSections.find((s) => settingsSectionToPath[s] === section);

    if (!matchedSection) return <Navigate to={agencySettingsGeneralPath} replace />;

    const sectionNodes: Record<SettingsSection, ReactNode> = {
        [SettingsSection.General]: <GeneralSettings />,
        [SettingsSection.Agency]: <AgencySettings />,
        [SettingsSection.Projects]: focusedProject ? <ProjectsSettings /> : null,
        [SettingsSection.Subscription]: <SubscriptionSettings />,
    };

    return sectionNodes[matchedSection];
}
