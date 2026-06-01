import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { SidePanel } from "~/components/ui/SidePanel";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import { SettingsSection, getSettingsSectionsForRoles, settingsSectionTranslationKeys, settingsSectionToIcon, settingsSectionToPath } from "~/models/enums/SettingsSection";
import { agencySettingsPath } from "~/routes/routePaths";

interface SettingsPageViewProps {
    basePath?: string;
}

export default function SettingsPageView({ basePath = agencySettingsPath }: SettingsPageViewProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();

    const visibleSections = getSettingsSectionsForRoles(user?.roles ?? []);

    const activeSection = visibleSections.find(
        (section) => location.pathname === `${basePath}/${settingsSectionToPath[section]}`
    ) ?? SettingsSection.General;

    return (
        <div className={`flex h-full ${isDesktop ? 'flex-row overflow-hidden' : 'flex-col'}`}>
            {!isDesktop && (
                <div className="flex flex-row gap-2 overflow-x-auto scrollbar-none px-3 py-3 border-b border-pale-gray shrink-0">
                    {visibleSections.map((section) => (
                        <IconWithTextTile
                            key={section}
                            icon={settingsSectionToIcon[section]}
                            label={t(settingsSectionTranslationKeys[section])}
                            isSelected={activeSection === section}
                            className="shrink-0"
                            onClick={() => navigate(`${basePath}/${settingsSectionToPath[section]}`)}
                        />
                    ))}
                </div>
            )}

            {isDesktop && (
                    <div className="p-3 flex flex-col align-center gap-1 w-50 border-r border-pale-gray">
                        {visibleSections.map((section) => (
                            <IconWithTextTile
                                key={section}
                                icon={settingsSectionToIcon[section]}
                                label={t(settingsSectionTranslationKeys[section])}
                                isSelected={activeSection === section}
                                onClick={() => navigate(`${basePath}/${settingsSectionToPath[section]}`)}
                            />
                        ))}
                    </div>

            )}

            <div className={`flex-1 min-h-0 ${isDesktop ? 'overflow-hidden' : ''}`}>
                <Outlet />
            </div>
        </div>
    );
}
