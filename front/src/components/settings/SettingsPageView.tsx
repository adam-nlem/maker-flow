import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { SidePanel } from "~/components/ui/SidePanel";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import { SettingsSection, getSettingsSectionsForRoles, settingsSectionTranslationKeys, settingsSectionToIcon, settingsSectionToPath } from "~/models/enums/SettingsSection";
import { agencySettingsPath } from "~/routes/routePaths";

export default function SettingsPageView() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();

    const visibleSections = getSettingsSectionsForRoles(user?.roles ?? []);

    const activeSection = visibleSections.find(
        (section) => location.pathname === `${agencySettingsPath}/${settingsSectionToPath[section]}`
    ) ?? SettingsSection.General;

    return (
        <div className={`flex h-full ${isDesktop ? 'flex-row overflow-hidden' : 'flex-col'}`}>
            {!isDesktop && (
                <div className="flex flex-row gap-2 overflow-x-auto scrollbar-none px-3 py-3 border-b border-light-gray shrink-0">
                    {visibleSections.map((section) => (
                        <IconWithTextTile
                            key={section}
                            icon={settingsSectionToIcon[section]}
                            label={t(settingsSectionTranslationKeys[section])}
                            isSelected={activeSection === section}
                            className="shrink-0"
                            onClick={() => navigate(`${agencySettingsPath}/${settingsSectionToPath[section]}`)}
                        />
                    ))}
                </div>
            )}

            {isDesktop && (
                <SidePanel title={t("settings:title")} side="left">
                    <div className="p-3 flex flex-col gap-1">
                        {visibleSections.map((section) => (
                            <IconWithTextTile
                                key={section}
                                icon={settingsSectionToIcon[section]}
                                label={t(settingsSectionTranslationKeys[section])}
                                isSelected={activeSection === section}
                                onClick={() => navigate(`${agencySettingsPath}/${settingsSectionToPath[section]}`)}
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
