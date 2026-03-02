import { CalendarDaysIcon, ChartBarIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon, GlobeEuropeAfricaIcon, HomeIcon, LifebuoyIcon, MoonIcon, PencilSquareIcon, PlusIcon, SparklesIcon, SunIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarDaysIconSolid, HomeIcon as HomeIconSolid, GlobeEuropeAfricaIcon as GlobeEuropeAfricaIconSolid, ChartBarIcon as ChartBarIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, LifebuoyIcon as LifebuoyIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid } from "@heroicons/react/24/solid";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { Button } from "../ui/Button";
import { useEffect } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";
import ProjectTile from "../projects/ProjectTile";
import IconWithTextTile from "../ui/IconWithTextTile";
import { useLocation, useNavigate } from "react-router";
import Shimmer from "../ui/Shimmer";

import SelectDropdown from "../ui/SelectDropdown"
import type { Project } from "~/models/Project"
import { useSidebarStore } from "~/stores/sidebar/sidebarStore";
import { useThemeStore } from "~/stores/theme/themeStore";

import { useCreateProjectModalStore } from "~/stores/project/createProjectModalStore";
import UpdateProjectModal from "../projects/UpdateProjectModal";
import { useUpdateProjectStore } from "~/stores/project/updateProjectStore";

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser()

  const { projects, isLoading: isLoadingProjects } = useListPaginatedProjects()
  const { focusedProjectUuid, setFocusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  const isExpanded = useSidebarStore((state) => state.isExpanded)
  const setIsExpanded = useSidebarStore((state) => state.setIsExpanded)

  const isCreateProjectModalOpen = useCreateProjectModalStore((state) => state.isCreateModalOpen)
  const setIsCreateProjectModalOpen = useCreateProjectModalStore((state) => state.setIsCreateModalOpen)

  const updatingProjectUuid = useUpdateProjectStore((state) => state.updatingProjectUuid)
  const setUpdatingProjectUuid = useUpdateProjectStore((state) => state.setUpdatingProjectUuid)

  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

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

          {isLoadingProjects ? <Shimmer width="w-10" height="h-10" /> :

            focusedProject ?
              <SelectDropdown<Project>
                items={projects}
                selectedItemId={focusedProject?.uuid}
                getItemId={(project) => project.uuid}
                onSelect={(project) => {
                  setFocusedProjectUuid(project.uuid)
                }}
                onClickCreateButton={() => setIsCreateProjectModalOpen(!isCreateProjectModalOpen)}
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
              <Button
                type="button"
                onClick={() => {
                  setIsCreateProjectModalOpen(!isCreateProjectModalOpen)
                }}
              >
                <div className="flex flex-row justify-center items-center gap-3 shrink-0 ">
                  {isExpanded && <p className="text-sm ">Créer un nouveau Projet</p>}
                  <PlusIcon className="size-4 text-clear" strokeWidth={2} />
                </div>
              </Button>


          }

          {/* NAVIGATION SECTION */}
          <div className={`mt-10 flex flex-col gap-1 ${isExpanded ? '' : 'items-center'}`}>
            <IconWithTextTile
              icon={location.pathname === '/' ? HomeIconSolid : HomeIcon}
              label="Accueil"
              isExpanded={isExpanded}
              isSelected={location.pathname === '/'}
              onClick={() => navigate('/')}
            />
            <IconWithTextTile
              icon={location.pathname === '/tasks' ? GlobeEuropeAfricaIconSolid : GlobeEuropeAfricaIcon}
              label="Veille"
              isExpanded={isExpanded}
              isSelected={location.pathname === '/tasks'}
              onClick={() => navigate('/tasks')}
            />
            <IconWithTextTile
              icon={location.pathname.startsWith('/scripts') ? ClipboardDocumentCheckIconSolid : ClipboardDocumentCheckIcon}
              label="Script"
              isExpanded={isExpanded}
              isSelected={location.pathname.startsWith('/scripts')}
              onClick={() => navigate('/scripts')}
            />
            <IconWithTextTile
              icon={location.pathname === '/calendar' ? CalendarDaysIconSolid : CalendarDaysIcon}
              label="Calendrier"
              isExpanded={isExpanded}
              isSelected={location.pathname === '/calendar'}
              onClick={() => navigate('/calendar')}
            />
            <IconWithTextTile
              icon={location.pathname.startsWith('/insights') ? ChartBarIconSolid : ChartBarIcon}
              label="Statistiques"
              isExpanded={isExpanded}
              isSelected={location.pathname.startsWith('/insights')}
              onClick={() => navigate('/insights')}
            />
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className={isExpanded ? '' : 'flex flex-col items-center'}>
          {/* BOTTOM NAVIGATION */}
          <div className={`mb-5 flex flex-col p-3 ${isExpanded ? '' : 'items-center'}`}>
            <IconWithTextTile
              icon={isDark ? SunIcon : MoonIcon}
              label={isDark ? 'Mode clair' : 'Mode sombre'}
              isExpanded={isExpanded}
              isBold={false}
              onClick={toggleTheme}
            />
            <IconWithTextTile
              icon={location.pathname.startsWith('/settings') ? Cog6ToothIconSolid : Cog6ToothIcon}
              label="Paramètres"
              isExpanded={isExpanded}
              isBold={false}
              isSelected={location.pathname.startsWith('/settings')}
              onClick={() => navigate('/settings')}
            />
            <IconWithTextTile
              icon={location.pathname === '/help' ? LifebuoyIconSolid : LifebuoyIcon}
              label="Aide"
              isExpanded={isExpanded}
              isBold={false}
              isSelected={location.pathname === '/help'}
              onClick={() => navigate('/help')}
            />
          </div>

          <div className="border-t border-light-gray rounded w-full"></div>

          <div className="p-3">
            <Button
              type="button"
              style="primary"
              onClick={() => navigate('/settings/subscription')}
            >
              <div className="flex flex-row justify-center items-center gap-3">
                <SparklesIcon className="size-4 text-clear" strokeWidth={2} />
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
