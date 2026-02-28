import { useState, type ReactNode } from "react";
import { SidePanel } from "~/components/ui/SidePanel";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import { SettingsSection, settingsSectionOptions, settingsSectionToFrenchTranslation, settingsSectionToIcon } from "~/models/enums/SettingsSection";
import GeneralSettings from "./GeneralSettings";
import CreatorProfileSettings from "./CreatorProfileSettings";
import ProjectSettings from "./ProjectSettings";
import IntegrationSettings from "./IntegrationSettings";
import SubscriptionSettings from "./SubscriptionSettings";

interface SettingsPageViewProps {
    projectUuid: string | null;
}

export default function SettingsPageView({ projectUuid }: SettingsPageViewProps) {
    const [activeSection, setActiveSection] = useState<SettingsSection>(SettingsSection.General);

    const sectionContent: Record<SettingsSection, ReactNode> = {
        [SettingsSection.General]: <GeneralSettings />,
        [SettingsSection.Project]: <ProjectSettings />,
        [SettingsSection.Integration]: <IntegrationSettings />,
        [SettingsSection.CreatorProfile]: projectUuid && <CreatorProfileSettings projectUuid={projectUuid} />,
        [SettingsSection.Subscription]: <SubscriptionSettings />,
    };

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <SidePanel title="Paramètres" side="left">
                <div className="p-3 flex flex-col gap-1">
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
                </div>
            </SidePanel>

            <div className="flex-1 overflow-hidden">
                {sectionContent[activeSection]}
            </div>
        </div>
    );
}
