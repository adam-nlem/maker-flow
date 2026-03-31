import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidePanel } from "~/components/ui/SidePanel";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import { SettingsSection, settingsSectionOptions, settingsSectionToFrenchTranslation, settingsSectionToIcon, settingsSectionToPath } from "~/models/enums/SettingsSection";

export default function SettingsPageView() {
    const location = useLocation();
    const navigate = useNavigate();

    const activeSection = settingsSectionOptions.find(
        (section) => location.pathname === `/settings/${settingsSectionToPath[section]}`
    ) ?? SettingsSection.General;

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <SidePanel title="Paramètres" side="left">
                <div className="p-3 flex flex-col gap-1">
                    {settingsSectionOptions.map((section) => (
                        <IconWithTextTile
                            key={section}
                            icon={settingsSectionToIcon[section]}
                            label={settingsSectionToFrenchTranslation[section]}
                            isSelected={activeSection === section}
                            onClick={() => navigate(`/settings/${settingsSectionToPath[section]}`)}
                        />
                    ))}
                </div>
            </SidePanel>

            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
}
