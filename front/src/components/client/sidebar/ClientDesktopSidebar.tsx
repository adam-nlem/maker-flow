import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";
import { platformOptions } from "~/models/enums/Platform";
import {
  clientSidebarNavigationItems,
  navigationItemToIcon,
  navigationItemToIconSolid,
  navigationItemTranslationKeys,
} from "~/models/enums/NavigationItem";
import { isPathSelected } from "~/utils/navigationHelpers";
import IconRailTile from "~/components/sidebar/IconRailTile";
import IntegrationTile from "~/components/integrations/IntegrationTile";
import IntegrationLoginModal from "~/components/integrations/IntegrationLoginModal";
import SidebarShell from "~/components/sidebar/SidebarShell";
import CurrentAgencyTile from "~/components/sidebar/CurrentAgencyTile";

export default function ClientDesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const projectUuid = useFocusProjectStore((state) => state.focusedProjectUuid);
  const { project } = useShowProject(projectUuid);
  const { integrations } = useListIntegrations({ projectUuid });
  const openIntegrationLoginModal = useIntegrationLoginModalStore((state) => state.open);

  const agency = project?.agency ?? null;
  const identityTile = agency ? <CurrentAgencyTile agency={agency} compact /> : null;

  const topSection = (
    <>
      <div className="flex flex-col items-center gap-1">
        {clientSidebarNavigationItems.map(({ item, path }) => {
          const selected = isPathSelected(item, path, location.pathname);
          return (
            <IconRailTile
              key={item}
              icon={selected ? navigationItemToIconSolid[item] : navigationItemToIcon[item]}
              label={t(navigationItemTranslationKeys[item])}
              isSelected={selected}
              onClick={() => navigate(path)}
            />
          );
        })}
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
