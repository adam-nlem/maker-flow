import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon, Cog6ToothIcon, HomeIcon, LifebuoyIcon, PlusCircleIcon, PuzzlePieceIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, PuzzlePieceIcon as PuzzlePieceIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, LifebuoyIcon as LifebuoyIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "~/context/AuthContext";
import { useProject } from "~/context/ProjectContext";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";
import ProjectTile from "../projects/ProjectTile";
import NavigationTile from "./NavigationTile";
import ModuleTile from "./ModuleTile";
import Shimmer from "../ui/Shimmer";

import type { UserModule } from "~/models/UserModule";
import SelectItemModal from "../ui/SelectItemModal";
import type { Project } from "~/models/Project";

interface SideBarProps {
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    userModules: UserModule[];
}

export default function SideBar({ isExpanded, setIsExpanded, userModules }: SideBarProps) {
    const { user } = useAuth();
    const { focusedProject, projects, isLoadingProjects, setFocusedProject, addProjectInList } = useProject();
    const navigate = useNavigate();

    const [showSelectFocusedProjectModal, setShowSelectFocusedProjectModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    // Close modals when sidebar collapses
    useEffect(() => {
        if (!isExpanded) {
            setShowSelectFocusedProjectModal(false);
            setShowCreateProjectModal(false);
        }
    }, [isExpanded]);

    return (
        <div className="fixed inset-0 z-50 flex flex-row pointer-events-none">
            <div
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => {
                    if (!showSelectFocusedProjectModal &&
                        !showCreateProjectModal)
                        setIsExpanded(false)
                }}
                className={`h-full shrink-0 border-r border-light-gray bg-white flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${isExpanded ? 'w-72' : 'w-16'}`}
            >
                {/* TOP SECTION */}
                <div className={`p-3 ${isExpanded ? '' : 'flex flex-col items-center'}`}>
                    {/* PROJECT SELECTOR */}

                    {isLoadingProjects ? <Shimmer width="w-10" height="h-10" /> :

                        focusedProject ?
                            <ProjectTile
                                project={focusedProject}
                                moduleCount={userModules.length}
                                isExpanded={isExpanded}
                                rightIcon={
                                    isExpanded && <ChevronUpDownIcon className="size-5 text-gray -mb-0.5" strokeWidth={2} />
                                }
                                onClick={() => {
                                    setShowSelectFocusedProjectModal(true)
                                    setShowCreateProjectModal(false)
                                }}
                            />
                            :
                            <Button
                                type="button"
                                fullWidth
                                size="lg"
                                variant="secondary"
                                onClick={() => {
                                    setShowSelectFocusedProjectModal(!showSelectFocusedProjectModal)
                                    setShowCreateProjectModal(!showCreateProjectModal)
                                }
                                }
                            >
                                <div className="flex flex-row justify-center items-center gap-3 shrink-0 ">
                                    {isExpanded && <p className="text-sm ">Créer un nouveau Projet</p>}
                                    <PlusCircleIcon className="size-4 text-clear" strokeWidth={2} />
                                </div>
                            </Button>


                    }

                    {/* NAVIGATION SECTION */}
                    <div className={`mt-10 flex flex-col ${isExpanded ? '' : 'items-center'}`}>
                        <NavigationTile isExpanded={isExpanded} isBold={true} route="/" outlineIcon={HomeIcon} solidIcon={HomeIconSolid} label="Accueil" />
                        <NavigationTile isExpanded={isExpanded} isBold={true} route="/library" outlineIcon={PuzzlePieceIcon} solidIcon={PuzzlePieceIconSolid} label="Bibliothèque" />
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
                        <NavigationTile
                            isExpanded={isExpanded}
                            isBold={false}
                            route="/settings"
                            outlineIcon={Cog6ToothIcon}
                            solidIcon={Cog6ToothIconSolid}
                            label="Paramètres" />

                        <NavigationTile
                            isExpanded={isExpanded}
                            isBold={false}
                            route="/help"
                            outlineIcon={LifebuoyIcon}
                            solidIcon={LifebuoyIconSolid}
                            label="Aide" />

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
            <SelectItemModal<Project>
                showModal={showSelectFocusedProjectModal}
                items={projects}
                selectedItemId={focusedProject?.uuid}
                getItemId={(project) => project.uuid}
                onSelect={setFocusedProject}
                onClose={() => {
                    setShowSelectFocusedProjectModal(false);
                    setIsExpanded(false);
                }}
                onClickCreateButton={() => setShowCreateProjectModal(!showCreateProjectModal)}
                createButtonLabel="Créer un nouveau Projet"
                renderItem={({ item, isSelected, onSelect }) => (
                    <ProjectTile
                        project={item}
                        showCreatedAt={true}
                        rightIcon={isSelected ? <CheckIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} /> : null}
                        onClick={onSelect}
                    />
                )}
            />

            <CreateProjectModal
                showModal={showCreateProjectModal}
                onProjectCreated={(project) => addProjectInList(project)}
                onClose={() => {
                    setShowCreateProjectModal(false);
                    setIsExpanded(false);
                }}
            />

        </div>
    );
}