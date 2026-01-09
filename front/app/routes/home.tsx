import type { Route } from "./+types/home";
import SideBar from "~/components/sidebar/SideBar";
import { useListProjectUserModules } from "~/hooks/api/projects/useListProjectUserModules";
import { getModuleWidget, hasModuleWidget } from "~/modules/registry";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null
  const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);

  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16 flex flex-row flex-wrap">
        {isLoading && <p>Chargement...</p>}
        {userModules
          .filter((um) => hasModuleWidget(um.module.moduleIdentifier))
          .map((userModule) => {
            const Widget = getModuleWidget(userModule.module.moduleIdentifier);
            if (!Widget) return null;
            return <Widget key={userModule.uuid} userModuleUuid={userModule.uuid} />; 
          })}
      </div>
    </div>
  );
}
