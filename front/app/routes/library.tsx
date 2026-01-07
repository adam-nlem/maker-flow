import { useSidebar } from "~/context/SidebarContext";

import { useProject } from "~/context/ProjectContext";
import SideBar from "~/components/sidebar/SideBar";
import { Input } from "~/components/ui/Input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useListProjectUserModules } from "~/hooks/projects/useListProjectUserModules";
import { useListPaginatedModules } from "~/hooks/modules/useListPaginatedModules";
import ModuleCard from "~/components/sidebar/ModuleCard";
import type { Route } from "./+types/library";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Bibliothèque" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Library({ loaderData }: Route.ComponentProps) {
  const { isExpanded, setIsExpanded } = useSidebar()
  const { focusedProject } = useProject()
  const { modules } = useListPaginatedModules(12)
  const { userModules, isLoading } = useListProjectUserModules(focusedProject?.uuid);


  return <div className="w-screen h-screen overflow-hidden">
    <SideBar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    <div className="pl-16 pt-10 flex flex-col items-center h-full overflow-hidden">
      <div className="w-200 text-center mb-10 shrink-0">
        <h1 className="text-heading-xl mb-3">Tous les modules dont vous avez besoin pour concrétiser vos idées.</h1>
        <p className="text-body-sm mb-5">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
        <Input placeholder="Rechercher un module" icon={<MagnifyingGlassIcon className="size-5 text-gray -mb-0.5" strokeWidth={2} />} fullWidth />

      </div>
      <div className="flex-1 w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-center p-5 gap-5 h-full overflow-y-auto scrollbar-none scroll-pb-5">

          {focusedProject && modules.map((module) => <ModuleCard key={module.uuid} project={focusedProject} onUserModuleCreated={() => {}} module={module} userModule={userModules.find((userModule) => userModule.module.uuid === module.uuid)} />)}

        </div>
      </div>

    </div>
  </div>
} 
