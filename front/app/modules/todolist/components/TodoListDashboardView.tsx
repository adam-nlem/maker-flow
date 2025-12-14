import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useListTodoLists } from "../hooks/todoLists/useListTodoLists";
import { useState } from "react";

import type { ModuleWidgetProps } from "~/modules/registry";
import { useListPaginatedTodoListTasks } from "../hooks/todoListTasks/useListPaginatedTodoListTasks";
import { TodoListStatus } from "../models/enums/TodoListStatus";
import TodoListStatusColumn from "./todoListTasks/TodoListStatusColumn";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useUpdateTodoListTask } from "../hooks/todoListTasks/useUpdateTodoListTask";

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
        moveTaskToStatus,
    } = useListPaginatedTodoListTasks({ todoListUuid: currentTodoList?.uuid, limit: 10 })

    const { updateTodoListTask } = useUpdateTodoListTask()

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
                <DndContext onDragEnd={handleDragEnd}>
                    {Object.values(TodoListStatus).map((status) =>
                        <TodoListStatusColumn
                            key={status}
                            status={status}
                            tasks={todoListTasksGroupedByStatus.find(dto => dto.status === status)?.todoListTasks ?? []}
                            hasMore={paginationByStatus[status].hasMore}
                            todoListUuid={currentTodoList?.uuid}
                            onLoadMore={() => listMoreForStatus(status)}
                        />
                    )}
                </DndContext>
            </div>
        </div>
    );

    function handleDragEnd(event: DragEndEvent) {
        const { over, active } = event;
        if (!over) return;

        const taskUuid = active.id as string;
        const newStatus = over.id as TodoListStatus;

        moveTaskToStatus(taskUuid, newStatus);
        updateTodoListTask(taskUuid, { status: newStatus });
    }
}