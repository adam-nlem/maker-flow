import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Route } from "./+types/home";
import CreateProjectModal from "~/components/projects/CreateProjectModal";
import SideBar from "~/components/sidebar/SideBar";
import { CalendarDateRangeIcon, ExclamationCircleIcon, ExclamationTriangleIcon, TagIcon } from "@heroicons/react/24/solid";
import { Badge } from "~/components/ui/Badge";
import TodoListDashboardView from "~/modules/todoList/components/TodoListDashboardView";


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

  return (
    <div className="w-full">
      <SideBar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
    <div className="w-full pl-16 flex flex-row">
      <TodoListDashboardView />

    </div>
    
    <div className="w-full pl-16 flex flex-row">
      <TodoListDashboardView />
    </div>


    </div>
  );
}
