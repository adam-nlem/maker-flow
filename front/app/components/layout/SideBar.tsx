import { ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon, HomeIcon, LifebuoyIcon, PlusCircleIcon, Square3Stack3DIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "~/context/AuthContext";
import { useProject } from "~/context/ProjectContext";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";
import { useProjectUserModules } from "~/hooks/projects/useProjectUserModules";
import ProjectTile from "../projects/ProjectTile";
import SelectFocusedProjectModal from "../projects/SelectFocusedProjectModal";

interface SideBarProps {
    expand: boolean;
    setExpand: (expand: boolean) => void;
}

export default function SideBar({ expand, setExpand }: SideBarProps) {
    const { user } = useAuth();
    const { focusedProject, projects, setFocusedProject } = useProject();
    const { userModules } = useProjectUserModules(focusedProject?.uuid);
    const navigate = useNavigate();
    const location = useLocation();

    const [showSelectFocusedProjectModal, setShowSelectFocusedProjectModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    // Close modals when sidebar collapses
    useEffect(() => {
        if (!expand) {
            setShowSelectFocusedProjectModal(false);
            setShowCreateProjectModal(false);
        }
    }, [expand]);

    return (
        <div 
            onMouseEnter={() => setExpand(true)}
            onMouseLeave={() => setExpand(false)} 
            className={`fixed left-0 top-0 h-full border-r border-light-gray bg-white flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out ${
                expand ? 'w-72' : 'w-16'
            }`}
        >
            {/* TOP SECTION */}
            <div className="p-3">
                {/* PROJECT SELECTOR */}
                {expand ? (
                    focusedProject ? (
                        <ProjectTile
                            project={focusedProject}
                            moduleCount={userModules.length}
                            rightIcon={
                                <div className="flex flex-col justify-center leading-none">
                                    <ChevronUpIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} />
                                    <ChevronDownIcon className="size-3.5 text-gray -mt-0.5" strokeWidth={2} />
                                </div>
                            }
                            onClick={() => setShowSelectFocusedProjectModal(true)}
                        />
                    ) : (
                        <Button
                            type="button"
                            fullWidth
                            size="lg"
                            variant="secondary"
                            onClick={() => setShowCreateProjectModal(true)}
                        >
                            <div className="flex flex-row justify-center items-center gap-3">
                                <p className="text-sm">Créer un nouveau Projet</p>
                                <PlusCircleIcon className="size-4 text-clear" strokeWidth={2} />
                            </div>
                        </Button>
                    )
                ) : (
                    <div
                        className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-heading-md cursor-pointer"
                        onClick={() => setShowSelectFocusedProjectModal(true)}
                    >
                        {focusedProject ? focusedProject.name.charAt(0).toUpperCase() : <PlusCircleIcon className="size-5 text-clear" strokeWidth={2} />}
                    </div>
                )}

                {/* NAVIGATION SECTION */}
                <div className={`mt-10 flex flex-col ${expand ? '' : 'items-center'}`}>
                    <div
                        className={`flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 ${isActive('/') ? 'bg-light-gray' : 'hover:bg-light-gray'}`}
                        onClick={() => navigate('/')}
                    >
                        <HomeIcon className={`size-5 shrink-0 ${isActive('/') ? 'text-dark' : 'text-gray'}`} strokeWidth={2} />
                        {expand && <h1 className={`text-heading-sm whitespace-nowrap ${isActive('/') ? 'text-dark' : 'text-gray'}`}>Accueil</h1>}
                    </div>

                    <div
                        className={`flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 ${isActive('/library') ? 'bg-light-gray' : 'hover:bg-light-gray'}`}
                        onClick={() => navigate('/library')}
                    >
                        <Square3Stack3DIcon className={`size-5 shrink-0 ${isActive('/library') ? 'text-dark' : 'text-gray'}`} strokeWidth={2} />
                        {expand && <h1 className={`text-heading-sm whitespace-nowrap ${isActive('/library') ? 'text-dark' : 'text-gray'}`}>Bibliothèque</h1>}
                    </div>

                    <div
                        className={`flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 ${isActive('/settings') ? 'bg-light-gray' : 'hover:bg-light-gray'}`}
                        onClick={() => navigate('/settings')}
                    >
                        <Cog6ToothIcon className={`size-5 shrink-0 ${isActive('/settings') ? 'text-dark' : 'text-gray'}`} strokeWidth={2} />
                        {expand && <h1 className={`text-heading-sm whitespace-nowrap ${isActive('/settings') ? 'text-dark' : 'text-gray'}`}>Paramètres</h1>}
                    </div>
                </div>

                {expand && <div className="mt-5 border-t border-light-gray rounded mx-2"></div>}

                {/* MODULES SECTION */}
                {userModules.length > 0 && (
                    <div className={`mt-5 flex flex-col ${expand ? '' : 'items-center'}`}>
                        {expand && <h1 className="text-heading-xs text-gray pl-2 pb-1">Modules Actifs</h1>}
                        {userModules.map((userModule) => (
                            <div
                                key={userModule.uuid}
                                className={`flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-lg p-2 ${expand ? '' : 'justify-center'}`}
                                onClick={() => navigate(`/modules/${userModule.module.uuid}`)}
                            >
                                <div className="w-6 h-6 rounded-md bg-dark flex items-center justify-center text-xs text-white font-semibold shrink-0">
                                    {userModule.module.title.charAt(0).toUpperCase()}
                                </div>
                                {expand && <h1 className="text-heading-sm whitespace-nowrap">{userModule.module.title}</h1>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* BOTTOM SECTION */}
            <div className={expand ? '' : 'flex flex-col items-center'}>
                {/* BOTTOM NAVIGATION */}
                <div className={`mb-5 flex flex-col p-3 ${expand ? '' : 'items-center'}`}>
                    <div
                        className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-lg p-2"
                        onClick={() => navigate('/settings')}
                    >
                        <Cog6ToothIcon className="size-5 text-gray shrink-0" strokeWidth={1} />
                        {expand && <h1 className="text-body-sm text-gray whitespace-nowrap">Paramètres</h1>}
                    </div>

                    <div
                        className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-lg p-2"
                        onClick={() => navigate('/help')}
                    >
                        <LifebuoyIcon className="size-5 text-gray shrink-0" strokeWidth={1} />
                        {expand && <h1 className="text-body-sm text-gray whitespace-nowrap">Aide</h1>}
                    </div>
                </div>

                {expand && <div className="border-t border-light-gray rounded"></div>}

                {/* USER SECTION */}
                {user && (
                    expand ? (
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
                        <div className="mb-3 p-2 rounded-lg cursor-pointer hover:bg-light-gray">
                            <UserCircleIcon className="size-6 text-gray" strokeWidth={1.5} />
                        </div>
                    )
                )}
            </div>

            {/* Modals */}
            {(showSelectFocusedProjectModal || showCreateProjectModal) && <div className={`fixed inset-0 z-50 m-3 flex flex-row gap-3 ${expand ? 'bg-black/20 pointer-events-auto' : 'bg-transparent pointer-events-none'
                }`}
                onClick={() => setExpand(false)}>
                <SelectFocusedProjectModal
                    showModal={showSelectFocusedProjectModal}
                    onClose={() => setShowSelectFocusedProjectModal(false)}
                    projects={projects}
                    focusedProject={focusedProject}
                    setFocusedProject={setFocusedProject}
                    onClickCreateProjectButton={() => setShowCreateProjectModal(true)}
                />
                <CreateProjectModal
                    showModal={showCreateProjectModal}
                    onClose={() => setShowCreateProjectModal(false)}
                />
            </div>}
        </div>
    );
}