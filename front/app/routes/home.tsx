import { useState } from "react";
import type { Route } from "./+types/home";
import SideBar from "~/components/sidebar/SideBar";
import { useListProjectUserModules } from "~/hooks/projects/useListProjectUserModules";
import { getModuleWidget, hasModuleWidget } from "~/modules/registry";
import { useProject } from "~/context/ProjectContext";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { focusedProject } = useProject();
  const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);

  return (
    <div className="w-full">
      <SideBar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} userModules={userModules} />
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
