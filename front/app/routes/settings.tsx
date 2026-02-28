import { useState, type ReactNode } from "react";
import SideBar from "~/components/sidebar/SideBar";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import { SettingsSection, settingsSectionOptions, settingsSectionToFrenchTranslation, settingsSectionToIcon } from "~/models/enums/SettingsSection";
import GeneralSettings from "~/components/settings/GeneralSettings";
import CreatorProfileSettings from "~/components/settings/CreatorProfileSettings";
import ProjectSettings from "~/components/settings/ProjectSettings";
import IntegrationSettings from "~/components/settings/IntegrationSettings";
import SubscriptionSettings from "~/components/settings/SubscriptionSettings";

export default function SettingsPage() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    const [activeSection, setActiveSection] = useState<SettingsSection>(SettingsSection.General);

    const sectionContent: Record<SettingsSection, ReactNode> = {
        [SettingsSection.General]: <GeneralSettings />,
        [SettingsSection.Project]: <ProjectSettings />,
        [SettingsSection.Integration]: <IntegrationSettings />,
        [SettingsSection.CreatorProfile]: focusedProject && <CreatorProfileSettings projectUuid={focusedProject.uuid} />,
        [SettingsSection.Subscription]: <SubscriptionSettings />,
    };

    return (
        <div className="w-full">
            <SideBar />
            <div className="w-full pl-16">
                <div className="px-10 py-8">
                    <h1 className="text-heading-xl mb-8">Paramètres</h1>

                    <div className="flex flex-row gap-10">
                        <nav className="flex flex-col gap-1 w-50 shrink-0">
                            {settingsSectionOptions.map((section) => (
                                <IconWithTextTile
                                    key={section}
                                    icon={settingsSectionToIcon[section]}
                                    label={settingsSectionToFrenchTranslation[section]}
                                    isExpanded
                                    isSelected={activeSection === section}
                                    onClick={() => setActiveSection(section)}
                                />
                            ))}
                        </nav>

                        <div className="flex-1 min-w-0">
                            {sectionContent[activeSection]}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
