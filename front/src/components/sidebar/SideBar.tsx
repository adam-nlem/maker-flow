import { CalendarDaysIcon, ChartBarIcon, ChevronUpDownIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, HomeIcon, PencilSquareIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarDaysIconSolid, HomeIcon as HomeIconSolid, ChartBarIcon as ChartBarIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid } from "@heroicons/react/24/solid";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { Button } from "../ui/Button";
import { useEffect } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";
import ProjectTile from "../projects/ProjectTile";
import IconWithTextTile from "../ui/IconWithTextTile";
import { useLocation, useNavigate } from "react-router-dom";
import { calendarPath, homePath, insightsPath, scriptsPath, settingsPath, settingsSubscriptionPath } from "~/routes/routePaths";
import Shimmer from "../ui/Shimmer";

import SelectDropdown from "../ui/SelectDropdown"
import type { Project } from "~/models/Project"
import { useSidebarStore } from "~/stores/sidebar/sidebarStore";
import { useCreateProjectModalStore } from "~/stores/project/createProjectModalStore";
import UpdateProjectModal from "../projects/UpdateProjectModal";
import { useUpdateProjectStore } from "~/stores/project/updateProjectStore";

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { projects, isLoading: isLoadingProjects } = useListPaginatedProjects()
  const { subscription } = useShowCurrentSubscription()
  const { plans } = useListPlans()
  const currentPlanConfig = plans.find((p) => p.plan === subscription?.plan)
  const maxProjects = subscription ? (currentPlanConfig?.maxProjects ?? null) : 1
  const isAtProjectLimit = maxProjects !== null && projects.length >= maxProjects

  const { focusedProjectUuid, setFocusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  const isExpanded = useSidebarStore((state) => state.isExpanded)
  const setIsExpanded = useSidebarStore((state) => state.setIsExpanded)

  const isCreateProjectModalOpen = useCreateProjectModalStore((state) => state.isCreateModalOpen)
  const setIsCreateProjectModalOpen = useCreateProjectModalStore((state) => state.setIsCreateModalOpen)

  const updatingProjectUuid = useUpdateProjectStore((state) => state.updatingProjectUuid)
  const setUpdatingProjectUuid = useUpdateProjectStore((state) => state.setUpdatingProjectUuid)

  // Close modals when sidebar collapses
  useEffect(() => {
    if (!isExpanded) {
      setIsCreateProjectModalOpen(false)
    }
  }, [isExpanded, setIsCreateProjectModalOpen])

  return (
    <div className="fixed inset-0 z-10 flex flex-row pointer-events-none">
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!isCreateProjectModalOpen)
            setIsExpanded(false)
        }}
        className={`h-full shrink-0 border-r border-light-gray bg-clear flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${isExpanded ? 'w-72' : 'w-16'}`}
      >
        {/* TOP SECTION */}
        <div className={`p-3 ${isExpanded ? '' : 'flex flex-col items-center'}`}>
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
                createButtonLabel="Créer un nouveau Projet"
                renderTrigger={({ onClick }) => (
                  <ProjectTile
                    project={focusedProject}
                    rightIcon={
                      isExpanded && <ChevronUpDownIcon className="size-5 text-gray -mb-0.5" strokeWidth={2} />
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
                      {isExpanded && <p className="text-sm">Créer un nouveau Projet</p>}
                      <PlusIcon className="size-4" strokeWidth={2} />
                    </div>
                  </Button>
                  {isExpanded && <p className="text-body-xs text-gray text-center">Limite de projets atteinte</p>}
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setIsCreateProjectModalOpen(!isCreateProjectModalOpen)
                  }}
                >
                  <div className="flex flex-row justify-center items-center gap-3 shrink-0">
                    {isExpanded && <p className="text-sm">Créer un nouveau Projet</p>}
                    <PlusIcon className="size-4" strokeWidth={2} />
                  </div>
                </Button>
              )
            }

          </div>}

          {/* NAVIGATION SECTION */}
          <div className={`mt-10 flex flex-col gap-1 ${isExpanded ? '' : 'items-center'}`}>
            <IconWithTextTile
              icon={location.pathname === homePath ? HomeIconSolid : HomeIcon}
              label="Accueil"
              isExpanded={isExpanded}
              isSelected={location.pathname === homePath}
              onClick={() => navigate(homePath)}
            />
            <IconWithTextTile
              icon={location.pathname.startsWith(scriptsPath) ? ClipboardDocumentCheckIconSolid : ClipboardDocumentCheckIcon}
              label="Script"
              isExpanded={isExpanded}
              isSelected={location.pathname.startsWith(scriptsPath)}
              onClick={() => navigate(scriptsPath)}
            />
            <IconWithTextTile
              icon={location.pathname === calendarPath ? CalendarDaysIconSolid : CalendarDaysIcon}
              label="Calendrier"
              isExpanded={isExpanded}
              isSelected={location.pathname === calendarPath}
              onClick={() => navigate(calendarPath)}
            />
            <IconWithTextTile
              icon={location.pathname.startsWith(insightsPath) ? ChartBarIconSolid : ChartBarIcon}
              label="Statistiques"
              isExpanded={isExpanded}
              isSelected={location.pathname.startsWith(insightsPath)}
              onClick={() => navigate(insightsPath)}
            />
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className={isExpanded ? '' : 'flex flex-col items-center'}>
          {/* BOTTOM NAVIGATION */}
          <div className={`mb-5 flex flex-col p-3 ${isExpanded ? '' : 'items-center'}`}>
            <IconWithTextTile
              icon={location.pathname.startsWith(settingsPath) ? Cog6ToothIconSolid : Cog6ToothIcon}
              label="Paramètres"
              isExpanded={isExpanded}
              isBold={false}
              isSelected={location.pathname.startsWith(settingsPath)}
              onClick={() => navigate(settingsPath)}
            />
          </div>

          <div className="border-t border-light-gray rounded w-full"></div>

          <div className="p-3">
            <Button
              type="button"
              style="primary"
              onClick={() => navigate(settingsSubscriptionPath)}
            >
              <div className="flex flex-row justify-center items-center gap-3">
                <SparklesIcon className="size-4" strokeWidth={2} />
                {isExpanded ? <p className="text-sm">Passer Premium ?</p> : null}
              </div>
            </Button>
          </div>
        </div>
      </div>


      {/* Modals */}
      <CreateProjectModal
        showModal={isCreateProjectModalOpen}
        onProjectCreated={() => setIsCreateProjectModalOpen(false)}
        onClose={() => {
          setIsCreateProjectModalOpen(false);
          setIsExpanded(false);
        }}
      />

      {updatingProjectUuid && <UpdateProjectModal
        project={projects.find((project) => project.uuid === updatingProjectUuid)}
        showModal
        onClose={() => setUpdatingProjectUuid(null)}
      />}

    </div>
  );
}
