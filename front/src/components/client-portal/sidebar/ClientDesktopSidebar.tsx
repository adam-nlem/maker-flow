import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomeIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from "@heroicons/react/24/solid";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import Shimmer from "~/components/ui/Shimmer";
import SidebarShell from "~/components/sidebar/SidebarShell";
import {
    clientHomePath,
    clientSettingsGeneralPath,
    clientSettingsPath,
} from "~/routes/routePaths";

export default function ClientDesktopSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { user } = useCurrentUser();
    const { project, isLoading: isLoadingProject } = useShowProject(user?.clientProjectUuid);

    const agency = project?.agency ?? null;
    const isHomeSelected = location.pathname === clientHomePath;
    const isSettingsSelected = location.pathname.startsWith(clientSettingsPath);

    const topSection = (
        <>
            <div className="flex flex-col gap-1 px-2 py-3">
                {isLoadingProject ? (
                    <Shimmer width="w-32" height="h-5" />
                ) : agency ? (
                    <span
                        className="text-heading-sm font-semibold whitespace-nowrap truncate"
                        style={agency.brandColor ? { color: agency.brandColor } : undefined}
                    >
                        {agency.name}
                    </span>
                ) : null}
                {user?.firstName && (
                    <span className="text-body-xs text-gray whitespace-nowrap truncate">
                        {t("clientPortal:sidebar.greeting", { name: user.firstName })}
                    </span>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-1">
                <IconWithTextTile
                    icon={isHomeSelected ? HomeIconSolid : HomeIcon}
                    label={t("navigation:items.home")}
                    isSelected={isHomeSelected}
                    onClick={() => navigate(clientHomePath)}
                />
            </div>
        </>
    );

    const bottomNav = (
        <IconWithTextTile
            icon={isSettingsSelected ? Cog6ToothIconSolid : Cog6ToothIcon}
            label={t("navigation:items.settings")}
            isBold={false}
            isSelected={isSettingsSelected}
            onClick={() => navigate(clientSettingsGeneralPath)}
        />
    );

    return <SidebarShell topSection={topSection} bottomNav={bottomNav} />;
}
