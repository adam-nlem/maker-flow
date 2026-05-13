import { ChevronUpDownIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { useCurrentAgency } from "~/hooks/api/agency/useCurrentAgency";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { Button } from "../ui/Button";
import CreateProjectModal from "../projects/CreateProjectModal";
import ProjectTile from "../projects/ProjectTile";
import IconWithTextTile from "../ui/IconWithTextTile";
import IdentityTile from "./IdentityTile";
import { useLocation, useNavigate } from "react-router-dom";
import Shimmer from "../ui/Shimmer";
import SelectDropdown from "../ui/SelectDropdown"
import type { Project } from "~/models/Project"
import { useCreateProjectModalStore } from "~/stores/project/createProjectModalStore";
import UpdateProjectModal from "../projects/UpdateProjectModal";
import { useUpdateProjectStore } from "~/stores/project/updateProjectStore";
import { platformOptions } from "~/models/enums/Platform";
import { sidebarMainNavigationItems, sidebarBottomNavigationItems, navigationItemTranslationKeys, navigationItemToIcon, navigationItemToIconSolid, navigationItemToPath } from "~/models/enums/NavigationItem";
import { useTranslation } from "react-i18next";
import { isNavigationItemSelected } from "~/utils/navigationHelpers";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import IntegrationTile from "../integrations/IntegrationTile";
import IntegrationLoginModal from "../integrations/IntegrationLoginModal";
import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";
import SidebarShell from "./SidebarShell";

export default function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { agency } = useCurrentAgency()
  const { projects, isLoading: isLoadingProjects } = useListPaginatedProjects()
  const { subscription } = useShowCurrentSubscription()
  const { plans } = useListPlans()
  const currentPlanConfig = plans.find((p) => p.plan === subscription?.plan)
  const maxProjects = subscription ? (currentPlanConfig?.maxProjects ?? null) : 1
  const isAtProjectLimit = maxProjects !== null && projects.length >= maxProjects

  const { focusedProjectUuid, setFocusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  const isCreateProjectModalOpen = useCreateProjectModalStore((state) => state.isCreateModalOpen)
  const setIsCreateProjectModalOpen = useCreateProjectModalStore((state) => state.setIsCreateModalOpen)

  const updatingProjectUuid = useUpdateProjectStore((state) => state.updatingProjectUuid)
  const setUpdatingProjectUuid = useUpdateProjectStore((state) => state.setUpdatingProjectUuid)

  const { integrations } = useListIntegrations({ projectUuid: focusedProjectUuid })
  const openIntegrationLoginModal = useIntegrationLoginModalStore((state) => state.open)

  const topSection = (
    <>
      {/* PROJECT SELECTOR */}
      {isLoadingProjects ? <Shimmer width="w-10" height="h-10" /> : <div>

        {focusedProject ?
          <SelectDropdown<Project>
            items={projects}
            selectedItemId={focusedProject?.uuid}
            getItemId={(project) => project.uuid}
            onSelect={(project) => {
              setFocusedProjectUuid(project.uuid)
            }}
            onClickCreateButton={isAtProjectLimit ? undefined : () => setIsCreateProjectModalOpen(!isCreateProjectModalOpen)}
            createButtonLabel={t("sidebar:createProject")}
            renderTrigger={({ onClick }) => (
              <ProjectTile
                project={focusedProject}
                rightIcon={
                  <ChevronUpDownIcon className="size-5 text-gray -mb-0.5" strokeWidth={2} />
                }
                onClick={onClick}
              />
            )}
            renderItem={({ item, isSelected, onSelect }) => (
              <ProjectTile
                project={item}
                isSelected={isSelected}
                showCreatedAt={true}
                onHoverRightIcon={<PencilSquareIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} onClick={(e) => {
                  e.stopPropagation()
                  setUpdatingProjectUuid(item.uuid)
                }} />}
                onClick={onSelect}
              />
            )}
          />
          :
          isAtProjectLimit ? (
            <div className="flex flex-col items-center gap-1">
              <Button type="button" disabled>
                <div className="flex flex-row justify-center items-center gap-3 shrink-0">
                  <p className="text-sm">{t("sidebar:createProject")}</p>
                  <PlusIcon className="size-4" strokeWidth={2} />
                </div>
              </Button>
              <p className="text-body-xs text-gray text-center">{t("sidebar:projectLimitReached")}</p>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setIsCreateProjectModalOpen(!isCreateProjectModalOpen)
              }}
            >
              <div className="flex flex-row justify-center items-center gap-3 shrink-0">
                <p className="text-sm">{t("sidebar:createProject")}</p>
                <PlusIcon className="size-4" strokeWidth={2} />
              </div>
            </Button>
          )
        }

      </div>}

      {/* NAVIGATION SECTION */}
      <div className="mt-10 flex flex-col gap-1">
        {sidebarMainNavigationItems.map((item) => {
          const selected = isNavigationItemSelected(item, location.pathname);
          return (
            <IconWithTextTile
              key={item}
              icon={selected ? navigationItemToIconSolid[item] : navigationItemToIcon[item]}
              label={t(navigationItemTranslationKeys[item])}
              isSelected={selected}
              onClick={() => navigate(navigationItemToPath[item])}
            />
          );
        })}
      </div>

      {/* INTEGRATION SECTION */}
      <div className="mt-10 flex flex-col gap-1">
        <h1 className="text-body-xs whitespace-nowrap px-2">
          {t("sidebar:platformsHeader")}
        </h1>
        {platformOptions.map((platform) => (
          <IntegrationTile
            key={platform}
            platform={platform}
            status={integrations.find((i) => i.platform === platform)?.status}
            onClick={() => focusedProjectUuid && openIntegrationLoginModal(focusedProjectUuid, platform)}
          />
        ))}
      </div>
    </>
  );

  const bottomNav = (
    <>
      {sidebarBottomNavigationItems.map((item) => {
        const selected = isNavigationItemSelected(item, location.pathname);
        return (
          <IconWithTextTile
            key={item}
            icon={selected ? navigationItemToIconSolid[item] : navigationItemToIcon[item]}
            label={t(navigationItemTranslationKeys[item])}
            isBold={false}
            isSelected={selected}
            onClick={() => navigate(navigationItemToPath[item])}
          />
        );
      })}
    </>
  );

  const identityTile = agency ? <IdentityTile agency={agency} /> : null;

  return (
    <>
      <SidebarShell topSection={topSection} bottomNav={bottomNav} identityTile={identityTile} />

      <CreateProjectModal
        showModal={isCreateProjectModalOpen}
        onProjectCreated={() => setIsCreateProjectModalOpen(false)}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />

      {updatingProjectUuid && <UpdateProjectModal
        project={projects.find((project) => project.uuid === updatingProjectUuid)}
        showModal
        onClose={() => setUpdatingProjectUuid(null)}
      />}

      <IntegrationLoginModal />
    </>
  );
}
