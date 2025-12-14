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
import { useListPaginatedTodoListTasks } from "../hooks/todoListTasks/useListPaginatedTodoListTasks";
import { TodoListStatus, todoListStatusToFrenchTranslation } from "../models/enums/TodoListStatus";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function TodoListDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { todoLists } = useListTodoLists({ userModuleUuid })


    const [currentIndex, setCurrentIndex] = useState(0)

    const currentTodoList = todoLists[currentIndex]

    const {
        todoListTasksGroupedByStatus,
        paginationByStatus,
        isLoading,
        isLoadingMore,
        errorMessage,
        listMoreForStatus,
    } = useListPaginatedTodoListTasks({ todoListUuid: currentTodoList?.uuid, limit: 10 })

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : todoLists.length - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < todoLists.length - 1 ? prev + 1 : 0))
    }
    return (
        <div className="m-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <ChevronLeftIcon onClick={goToPrevious} className="size-4 text-gray cursor-pointer hover:text-dark" strokeWidth={2} />
                <h1 className="text-heading-md">{currentTodoList?.title ?? "Aucune liste"}</h1>
                <ChevronRightIcon onClick={goToNext} className="size-4 text-gray cursor-pointer hover:text-dark" strokeWidth={2} />
            </div>

            <div className="flex flex-row gap-1.5 flex-1 min-h-0">

                {Object.values(TodoListStatus).map((status) =>
                    <div key={status} className="flex flex-col w-1/3 gap-3 min-h-0">

                        <div className="text-sm w-full rounded-sm text-center text-gray bg-light-gray shrink-0">
                            {todoListStatusToFrenchTranslation[status]}
                        </div>

                        <div className="relative flex-1 min-h-0">

                            <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-none h-full pb-5">
                                {
                                    todoListTasksGroupedByStatus
                                        .find(dto => dto.status === status)
                                        ?.todoListTasks.map((task) => <TodoListTaskCard key={task.uuid} task={task} />)
                                }
                                {paginationByStatus[status].hasMore && <SimpleTextButton onClick={() => listMoreForStatus(status)}>
                                    <ArrowPathIcon className="size-3.5" strokeWidth={2} />
                                    <p>Charger plus de tâches</p>
                                </SimpleTextButton>}

                                {currentTodoList && <CreateTodoListTaskCard todoListUuid={currentTodoList.uuid} />}
                            </div>
                            {/* Bottom Fade to smooth the scroll */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none" />
                        </div>

                    </div>)}
            </div>
        </div>
    );
}