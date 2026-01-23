import { useParams } from "react-router";
import SideBar from "~/components/sidebar/SideBar";
import { useListProjectUserModules } from "~/hooks/api/projects/useListProjectUserModules";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { getDashboardView, getPageView } from "~/modules/registry";
import { ModuleIdentifier } from "~/models/enums/ModuleIdentifier";

export default function ModulePage() {
    const { moduleIdentifier } = useParams<{ moduleIdentifier: string }>();
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;
    const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);

    if (!moduleIdentifier || !Object.values(ModuleIdentifier).includes(moduleIdentifier as ModuleIdentifier)) {
        return (
            <div className="w-full">
                <SideBar />
                <div className="w-full pl-16 flex items-center justify-center h-screen">
                    <p className="text-heading-lg">Module introuvable</p>
                </div>
            </div>
        );
    }

    const identifier = moduleIdentifier as ModuleIdentifier;
    const Page = getPageView(identifier);

    if (!Page) {
        return (
            <div className="w-full">
                <SideBar />
                <div className="w-full pl-16 flex items-center justify-center h-screen">
                    <p className="text-heading-lg">Module non disponible</p>
                </div>
            </div>
        );
    }

    const userModule = userModules.find((um) => um.module.moduleIdentifier === identifier);

    if (isLoading) {
        return (
            <div className="w-full">
                <SideBar />
                <div className="w-full pl-16 flex items-center justify-center h-screen">
                    <p className="text-body-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!userModule) {
        return (
            <div className="w-full">
                <SideBar />
                <div className="w-full pl-16 flex items-center justify-center h-screen">
                    <p className="text-heading-lg">Vous n'avez pas accès à ce module</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <SideBar />
            <div className="w-full pl-16">
                <Page userModuleUuid={userModule.uuid} />
            </div>
        </div>
    );
}
