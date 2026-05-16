import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { useCurrentAgency } from "~/hooks/api/agency/useCurrentAgency";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import CreateProjectModal from "../projects/CreateProjectModal";
import ProjectTile from "../projects/ProjectTile";
import IconRailTile from "./IconRailTile";
import IdentityTile from "./IdentityTile";
import { useLocation, useNavigate } from "react-router-dom";
import Shimmer from "../ui/Shimmer";
import SelectDropdown from "../ui/SelectDropdown"
import type { Project } from "~/models/Project"
import { useCreateProjectModalStore } from "~/stores/project/createProjectModalStore";
import UpdateProjectModal from "../projects/UpdateProjectModal";
import { useUpdateProjectStore } from "~/stores/project/updateProjectStore";
import { platformOptions } from "~/models/enums/Platform";
import { sidebarMainNavigationItems, navigationItemTranslationKeys, navigationItemToIcon, navigationItemToIconSolid, navigationItemToPath } from "~/models/enums/NavigationItem";
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
      {isLoadingProjects ? (
        <Shimmer width="w-9" height="h-9" radius="rounded-lg" />
      ) : focusedProject ? (
        <SelectDropdown<Project>
          items={projects}
          selectedItemId={focusedProject.uuid}
          getItemId={(project) => project.uuid}
          onSelect={(project) => setFocusedProjectUuid(project.uuid)}
          onClickCreateButton={isAtProjectLimit ? undefined : () => setIsCreateProjectModalOpen(!isCreateProjectModalOpen)}
          createButtonLabel={t("sidebar:createProject")}
          renderTrigger={({ onClick }) => (
            <ProjectTile project={focusedProject} onClick={onClick} compact />
          )}
          renderItem={({ item, isSelected, onSelect }) => (
            <ProjectTile
              project={item}
              isSelected={isSelected}
              showCreatedAt={true}
              onHoverRightIcon={<PencilSquareIcon className="size-3.5 text-muted-2 -mb-0.5" strokeWidth={2} onClick={(e) => {
                e.stopPropagation()
                setUpdatingProjectUuid(item.uuid)
              }} />}
              onClick={onSelect}
            />
          )}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsCreateProjectModalOpen(!isCreateProjectModalOpen)}
          disabled={isAtProjectLimit}
          aria-label={t("sidebar:createProject")}
          className="size-9 flex items-center justify-center rounded-lg bg-clear-3 text-dark-2 hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="size-5" strokeWidth={2} />
        </button>
      )}

      {/* NAVIGATION */}
      <div className="mt-4 flex flex-col items-center gap-1">
        {sidebarMainNavigationItems.map((item) => {
          const selected = isNavigationItemSelected(item, location.pathname);
          return (
            <IconRailTile
              key={item}
              icon={selected ? navigationItemToIconSolid[item] : navigationItemToIcon[item]}
              label={t(navigationItemTranslationKeys[item])}
              isSelected={selected}
              onClick={() => navigate(navigationItemToPath[item])}
            />
          );
        })}
      </div>

      {/* INTEGRATIONS */}
      <div className="mt-4 flex flex-col items-center gap-1">
        {platformOptions.map((platform) => (
          <IntegrationTile
            key={platform}
            platform={platform}
            status={integrations.find((i) => i.platform === platform)?.status}
            onClick={() => focusedProjectUuid && openIntegrationLoginModal(focusedProjectUuid, platform)}
            compact
          />
        ))}
      </div>
    </>
  );

  const identityTile = agency ? <IdentityTile agency={agency} compact /> : null;

  return (
    <>
      <SidebarShell topSection={topSection} identityTile={identityTile} />

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
