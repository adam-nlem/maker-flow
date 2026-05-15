import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    HomeIcon,
    RectangleStackIcon,
} from "@heroicons/react/24/outline";
import {
    HomeIcon as HomeIconSolid,
    RectangleStackIcon as RectangleStackIconSolid,
} from "@heroicons/react/24/solid";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";
import { platformOptions } from "~/models/enums/Platform";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import IntegrationTile from "~/components/integrations/IntegrationTile";
import IntegrationLoginModal from "~/components/integrations/IntegrationLoginModal";
import Shimmer from "~/components/ui/Shimmer";
import SidebarShell from "~/components/sidebar/SidebarShell";
import IdentityTile from "~/components/sidebar/IdentityTile";
import {
    clientHomePath,
    clientContentsPath,
} from "~/routes/routePaths";

export default function ClientDesktopSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { user } = useCurrentUser();
    const projectUuid = useFocusProjectStore((state) => state.focusedProjectUuid);
    const { project, isLoading: isLoadingProject } = useShowProject(projectUuid);
    const { integrations } = useListIntegrations({ projectUuid });
    const openIntegrationLoginModal = useIntegrationLoginModalStore((state) => state.open);

    const agency = project?.agency ?? null;
    const isHomeSelected = location.pathname === clientHomePath;
    const isContentsSelected = location.pathname === clientContentsPath;

    const identityTile = isLoadingProject ? (
        <div className="p-2">
            <Shimmer width="w-32" height="h-5" />
        </div>
    ) : agency ? (
        <IdentityTile agency={agency} />
    ) : null;

    const topSection = (
        <>
            {user?.firstName && (
                <span className="text-body-xs text-muted-2 whitespace-nowrap truncate block px-2 pb-4">
                    {t("clientPortal:sidebar.greeting", { name: user.firstName })}
                </span>
            )}

            <div className="flex flex-col gap-1">
                <IconWithTextTile
                    icon={isHomeSelected ? HomeIconSolid : HomeIcon}
                    label={t("navigation:items.home")}
                    isSelected={isHomeSelected}
                    onClick={() => navigate(clientHomePath)}
                />
                <IconWithTextTile
                    icon={isContentsSelected ? RectangleStackIconSolid : RectangleStackIcon}
                    label={t("navigation:items.contents")}
                    isSelected={isContentsSelected}
                    onClick={() => navigate(clientContentsPath)}
                />
            </div>

            <div className="mt-10 flex flex-col gap-1">
                <h1 className="text-body-xs whitespace-nowrap px-2">
                    {t("sidebar:platformsHeader")}
                </h1>
                {platformOptions.map((platform) => (
                    <IntegrationTile
                        key={platform}
                        platform={platform}
                        status={integrations.find((i) => i.platform === platform)?.status}
                        onClick={() => projectUuid && openIntegrationLoginModal(projectUuid, platform)}
                    />
                ))}
            </div>
        </>
    );

    return (
        <>
            <SidebarShell topSection={topSection} identityTile={identityTile} />
            <IntegrationLoginModal />
        </>
    );
}
