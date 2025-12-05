import { ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon, HomeIcon, LifebuoyIcon, PlusCircleIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";
import { useAuth } from "~/context/AuthContext";
import { useProject } from "~/context/ProjectContext";
// import { useUserModules } from "~/hooks/modules/useUserModules";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";

interface SideBarProps {
    show: boolean;
    onClose: () => void;
}

export default function SideBar({ show, onClose }: SideBarProps) {
    const { user } = useAuth();
    const { currentProject, projects, setCurrentProject } = useProject();
    // const { userModules } = useUserModules(currentProject?.uuid);
    const navigate = useNavigate();
    const location = useLocation();

    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    // Close modal when sidebar closes
    useEffect(() => {
        if (!show) {
            setShowCreateProjectModal(false);
        }
    }, [show]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-start justify-start transition-all duration-300 ${show ? 'bg-black/20 pointer-events-auto' : 'bg-transparent pointer-events-none'
                }`}
            onClick={onClose}
        >
            <div
                className={`border-r rounded-r-xl h-full border-light-gray flex flex-col justify-between w-1/5 lg:w-1/6 xl:w-[280px] bg-white transform transition-transform duration-300 ease-in-out ${show ? 'translate-x-0' : '-translate-x-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* TOP SECTION */}
                <div className="p-3">
                    {/* PROJECT SELECTOR */}
                    {currentProject ?
                        <div className="flex flex-row justify-between hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <div className="flex flex-row gap-3">
                                <div className="rounded-md bg-primary flex items-center justify-center h-10 w-10 text-heading-md">
                                    {currentProject.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-heading-sm">{currentProject.name}</h1>
                                    {/* <p className="text-body-xs">{userModules.length} Module{userModules.length !== 1 ? 's' : ''} Actif{userModules.length !== 1 ? 's' : ''}</p> */}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center leading-none">
                                <ChevronUpIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} />
                                <ChevronDownIcon className="size-3.5 text-gray -mt-0.5" strokeWidth={2} />
                            </div>
                        </div>
                        :
                        <Button
                            type="submit"
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
                    }

                    {/* NAVIGATION SECTION */}
                    <div className="mt-10 flex flex-col">
                        <div
                            className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2"
                            onClick={() => navigate('/')}
                        >
                            <HomeIcon className={`size-5 ${isActive('/') ? 'text-dark' : 'text-gray'}`} strokeWidth={2} />
                            <h1 className={`text-heading-sm ${isActive('/') ? 'text-dark' : 'text-gray'}`}>Accueil</h1>
                        </div>

                        <div
                            className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2"
                            onClick={() => navigate('/library')}
                        >
                            <Square3Stack3DIcon className={`size-5 ${isActive('/library') ? 'text-dark' : 'text-gray'}`} strokeWidth={2} />
                            <h1 className={`text-heading-sm ${isActive('/library') ? 'text-dark' : 'text-gray'}`}>Bibliothèque</h1>
                        </div>

                        <div
                            className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2"
                            onClick={() => navigate('/settings')}
                        >
                            <Cog6ToothIcon className={`size-5 ${isActive('/settings') ? 'text-dark' : 'text-gray'}`} strokeWidth={2} />
                            <h1 className={`text-heading-sm ${isActive('/settings') ? 'text-dark' : 'text-gray'}`}>Paramètres</h1>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-light-gray rounded mx-2"></div>

                    {/* MODULES SECTION
                    {userModules.length > 0 && (
                        <div className="mt-5 flex flex-col">
                            <h1 className="text-heading-xs text-gray pl-2 pb-1">Modules Actifs</h1>
                            {userModules.map((userModule) => (
                                <div
                                    key={userModule.uuid}
                                    className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2"
                                    onClick={() => navigate(`/modules/${userModule.module.uuid}`)}
                                >
                                    <div className="size-5 rounded-sm bg-primary flex items-center justify-center text-xs text-white font-semibold">
                                        {userModule.module.title.charAt(0).toUpperCase()}
                                    </div>
                                    <h1 className="text-heading-sm">{userModule.module.title}</h1>
                                </div>
                            ))}
                        </div>
                    )} */}
                </div>

                {/* BOTTOM SECTION */}
                <div>

                    {/* BOTTOM NAVIGATION */}
                    <div className="mb-5 flex flex-col p-3">
                        <div
                            className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2"
                            onClick={() => navigate('/settings')}
                        >
                            <Cog6ToothIcon className="size-5 text-gray" strokeWidth={1} />
                            <h1 className="text-body-sm text-gray">Paramètres</h1>
                        </div>

                        <div
                            className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2"
                            onClick={() => navigate('/help')}
                        >
                            <LifebuoyIcon className="size-5 text-gray" strokeWidth={1} />
                            <h1 className="text-body-sm text-gray">Aide</h1>
                        </div>
                    </div>

                    <div className="border-t border-light-gray rounded"></div>

                    {/* USER SECTION */}
                    {user && (
                        <div className="flex flex-row justify-between hover:bg-light-gray cursor-pointer rounded-md m-3 p-2">
                            <div className="flex flex-col">
                                <h1 className="text-heading-sm">{user.fullName}</h1>
                                <p className="text-body-xs">{user.email}</p>
                            </div>
                            <div className="flex flex-col justify-center leading-none">
                                <ChevronUpIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} />
                                <ChevronDownIcon className="size-3.5 text-gray -mt-0.5" strokeWidth={2} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="m-3">
                <CreateProjectModal showModal={showCreateProjectModal} onClose={() => setShowCreateProjectModal(false)} />
            </div>
        </div>
    )
}