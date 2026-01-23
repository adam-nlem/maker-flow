import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon, Cog6ToothIcon, HomeIcon, LifebuoyIcon, PencilSquareIcon, PlusIcon, PuzzlePieceIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, PuzzlePieceIcon as PuzzlePieceIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, LifebuoyIcon as LifebuoyIconSolid } from "@heroicons/react/24/solid";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { Button } from "../ui/Button";
import { useEffect } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";
import ProjectTile from "../projects/ProjectTile";
import IconWithTextTile from "../ui/IconWithTextTile";
import { useLocation, useNavigate } from "react-router";
import ModuleTile from "./ModuleTile";
import Shimmer from "../ui/Shimmer";

import SelectDropdown from "../ui/SelectDropdown"
import type { Project } from "~/models/Project"
import { useListProjectUserModules } from "~/hooks/api/projects/useListProjectUserModules";
import { useSidebarStore } from "~/stores/sidebar/sidebarStore";

import { useCreateProjectModalStore } from "~/stores/project/createProjectModalStore";
import UpdateProjectModal from "../projects/UpdateProjectModal";
import { useUpdateProject } from "~/hooks/api/projects/useUpdateProject";
import { useUpdateProjectStore } from "~/stores/project/updateProjectStore";

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser()

  const { projects, isLoading: isLoadingProjects } = useListPaginatedProjects()
  const { focusedProjectUuid, setFocusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null
  const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);

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
        className={`h-full shrink-0 border-r border-light-gray bg-white flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${isExpanded ? 'w-72' : 'w-16'}`}
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
                    moduleCount={userModules.length}
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
          <div className={`mt-10 flex flex-col ${isExpanded ? '' : 'items-center'}`}>
            <IconWithTextTile
              icon={location.pathname === '/' ? HomeIconSolid : HomeIcon}
              label="Accueil"
              isExpanded={isExpanded}
              isBold={true}
              isSelected={location.pathname === '/'}
              onClick={() => navigate('/')}
            />
            <IconWithTextTile
              icon={location.pathname === '/library' ? PuzzlePieceIconSolid : PuzzlePieceIcon}
              label="Bibliothèque"
              isExpanded={isExpanded}
              isBold={true}
              isSelected={location.pathname === '/library'}
              onClick={() => navigate('/library')}
            />
          </div>

          <div className="mt-5 border-t border-light-gray rounded px-2 w-full"></div>

          {/* MODULES SECTION */}
          {userModules.length > 0 && (
            <div className={`mt-5 flex flex-col ${isExpanded ? '' : 'items-center'}`}>
              {isExpanded && <h1 className="text-heading-xs text-gray pl-2 pb-1">Modules Actifs</h1>}
              {userModules.map((userModule) => (
                <ModuleTile key={userModule.uuid} isExpanded={isExpanded} userModule={userModule} />
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION */}
        <div className={isExpanded ? '' : 'flex flex-col items-center'}>
          {/* BOTTOM NAVIGATION */}
          <div className={`mb-5 flex flex-col p-3 ${isExpanded ? '' : 'items-center'}`}>
            <IconWithTextTile
              icon={location.pathname === '/settings' ? Cog6ToothIconSolid : Cog6ToothIcon}
              label="Paramètres"
              isExpanded={isExpanded}
              isBold={false}
              isSelected={location.pathname === '/settings'}
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

          {/* USER SECTION */}
          {user && (
            isExpanded ? (
              <div className="flex flex-row justify-between hover:bg-light-gray cursor-pointer rounded-lg m-3 p-2">
                <div className="flex flex-col">
                  <h1 className="text-heading-sm whitespace-nowrap">{user.fullName}</h1>
                  <p className="text-body-xs text-gray whitespace-nowrap">{user.email}</p>
                </div>
                <div className="flex flex-col justify-center leading-none">
                  <ChevronUpIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} />
                  <ChevronDownIcon className="size-3.5 text-gray -mt-0.5" strokeWidth={2} />
                </div>
              </div>
            ) : (
              <div className="my-4.75 p-2 rounded-lg cursor-pointer hover:bg-light-gray">
                <UserCircleIcon className="size-6 text-gray" strokeWidth={1.5} />
              </div>
            )
          )}
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
