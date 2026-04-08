import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { SidePanel } from "~/components/ui/SidePanel";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import { SettingsSection, settingsSectionOptions, settingsSectionToFrenchTranslation, settingsSectionToIcon, settingsSectionToPath } from "~/models/enums/SettingsSection";

export default function SettingsPageView() {
    const location = useLocation();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();

    const activeSection = settingsSectionOptions.find(
        (section) => location.pathname === `/settings/${settingsSectionToPath[section]}`
    ) ?? SettingsSection.General;

    return (
        <div className={`flex h-full ${isDesktop ? 'flex-row overflow-hidden' : 'flex-col'}`}>
            {!isDesktop && (
                <div className="flex flex-row gap-2 overflow-x-auto scrollbar-none px-3 py-3 border-b border-light-gray shrink-0">
                    {settingsSectionOptions.map((section) => (
                        <IconWithTextTile
                            key={section}
                            icon={settingsSectionToIcon[section]}
                            label={settingsSectionToFrenchTranslation[section]}
                            isSelected={activeSection === section}
                            className="shrink-0"
                            onClick={() => navigate(`/settings/${settingsSectionToPath[section]}`)}
                        />
                    ))}
                </div>
            )}

            {isDesktop && (
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
            )}

            <div className={`flex-1 min-h-0 ${isDesktop ? 'overflow-hidden' : ''}`}>
                <Outlet />
            </div>
        </div>
    );
}
