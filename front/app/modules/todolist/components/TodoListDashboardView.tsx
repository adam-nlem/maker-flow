import { ChevronLeftIcon, ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Badge } from "~/components/ui/Badge";
import TodoListTaskCard from "./TodoListTaskCard";
import { TodoListTask } from "../models/TodoListTask";
import { TodoListPriority } from "../models/enums/TodoListPriority";
import { Color } from "~/models/enums/Color";
import { useListTodoLists } from "../hooks/todoLists/useListTodoLists";
import { useState } from "react";

import type { ModuleWidgetProps } from "~/modules/registry";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
import CreateTodoListTaskCard from "./todoListTasks/CreateTodoListTaksCard";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists } = useListTodoLists({ userModuleUuid })
    const [currentIndex, setCurrentIndex] = useState(0)

    const currentTodoList = todoLists[currentIndex]

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : todoLists.length - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < todoLists.length - 1 ? prev + 1 : 0))
    }
    return (
        <div className="m-5 w-1/3 max-h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center">
                <ChevronLeftIcon onClick={goToPrevious} className="size-4 text-gray cursor-pointer hover:text-dark" strokeWidth={2} />
                <h1 className="text-heading-md">{currentTodoList?.title ?? "Aucune liste"}</h1>
                <ChevronRightIcon onClick={goToNext} className="size-4 text-gray cursor-pointer hover:text-dark" strokeWidth={2} />
            </div>

            <div className="flex flex-row gap-1.5">

                <div className="flex flex-col w-1/3 gap-3">

                    <div className="text-sm w-full rounded-sm text-center text-gray bg-light-gray">
                        A Faire
                    </div>

                    
                  {currentTodoList && <CreateTodoListTaskCard todoListUuid={currentTodoList.uuid} />}


                </div>

                <div className="flex flex-col w-1/3 ">

                    <div className="text-sm w-full rounded-sm text-center text-blue-600 bg-blue-300">
                        En Cours
                    </div>

                </div>

                <div className="flex flex-col w-1/3 ">

                    <div className="text-sm w-full rounded-sm text-center text-primary bg-primary/30">
                        Terminée
                    </div>

                </div>
            </div>
        </div>
    );
}