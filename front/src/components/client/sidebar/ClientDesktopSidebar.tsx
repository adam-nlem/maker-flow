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
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";
import { platformOptions } from "~/models/enums/Platform";
import IconRailTile from "~/components/sidebar/IconRailTile";
import IntegrationTile from "~/components/integrations/IntegrationTile";
import IntegrationLoginModal from "~/components/integrations/IntegrationLoginModal";
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
    const projectUuid = useFocusProjectStore((state) => state.focusedProjectUuid);
    const { project } = useShowProject(projectUuid);
    const { integrations } = useListIntegrations({ projectUuid });
    const openIntegrationLoginModal = useIntegrationLoginModalStore((state) => state.open);

    const agency = project?.agency ?? null;
    const isHomeSelected = location.pathname === clientHomePath;
    const isContentsSelected = location.pathname === clientContentsPath;

    const identityTile = agency ? <IdentityTile agency={agency} compact /> : null;

    const topSection = (
        <>
            <div className="flex flex-col items-center gap-1">
                <IconRailTile
                    icon={isHomeSelected ? HomeIconSolid : HomeIcon}
                    label={t("navigation:items.home")}
                    isSelected={isHomeSelected}
                    onClick={() => navigate(clientHomePath)}
                />
                <IconRailTile
                    icon={isContentsSelected ? RectangleStackIconSolid : RectangleStackIcon}
                    label={t("navigation:items.contents")}
                    isSelected={isContentsSelected}
                    onClick={() => navigate(clientContentsPath)}
                />
            </div>

            <div className="mt-4 flex flex-col items-center gap-1">
                {platformOptions.map((platform) => (
                    <IntegrationTile
                        key={platform}
                        platform={platform}
                        status={integrations.find((i) => i.platform === platform)?.status}
                        onClick={() => projectUuid && openIntegrationLoginModal(projectUuid, platform)}
                        compact
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
