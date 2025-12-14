import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useListTodoLists } from "../hooks/todoLists/useListTodoLists";
import { useState } from "react";

import type { ModuleWidgetProps } from "~/modules/registry";
import { useListPaginatedTodoListTasks } from "../hooks/todoListTasks/useListPaginatedTodoListTasks";
import { TodoListStatus } from "../models/enums/TodoListStatus";
import TodoListStatusColumn from "./todoListTasks/TodoListStatusColumn";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import type { TodoListTask } from "../models/TodoListTask";
import TodoListTaskCard from "./todoListTasks/TodoListTaskCard";
import { useUpdateTodoListTask } from "../hooks/todoListTasks/useUpdateTodoListTask";
import DetailTodoListTaskModal from "./todoListTasks/DetailTodoListTaskModal";

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
        syncTaskInGroups,
        removeTaskFromGroups,
        getTaskByUuid
    } = useListPaginatedTodoListTasks({ todoListUuid: currentTodoList?.uuid, limit: 10 })

    const { updateTodoListTask } = useUpdateTodoListTask()

    const [draggedTask, setDraggedTask] = useState<TodoListTask | null>(null)
    const [selectedTask, setSelectedTask] = useState<TodoListTask | null>(null)

    // The drag only activates after the pointer moves at least 8 pixels
    // Prevents the drag to trigger onClick
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

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
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    {Object.values(TodoListStatus).map((status) =>
                        <TodoListStatusColumn
                            key={status}
                            status={status}
                            tasks={todoListTasksGroupedByStatus.find(dto => dto.status === status)?.todoListTasks ?? []}
                            hasMore={paginationByStatus[status].hasMore}
                            isLoading={isLoading}
                            todoListUuid={currentTodoList?.uuid}
                            onLoadMore={() => listMoreForStatus(status)}
                            onTaskClick={setSelectedTask}
                            onTaskCreated={syncTaskInGroups}
                        />
                    )}
                    <DragOverlay dropAnimation={null}>
                        {draggedTask && <TodoListTaskCard task={draggedTask} isDragDisabled />}
                    </DragOverlay>
                </DndContext>
            </div>

            {selectedTask && currentTodoList && (
                <DetailTodoListTaskModal
                    todoListUuid={currentTodoList.uuid}
                    task={selectedTask}
                    showModal={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onTaskUpdated={syncTaskInGroups}
                    onTaskDeleted={(deletedTaskUuid) => {
                        removeTaskFromGroups(deletedTaskUuid);
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );

    function handleDragStart(event: DragStartEvent) {
        const task = getTaskByUuid(event.active.id as string);
        setDraggedTask(task ?? null);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { over, active } = event;
        if (!over) return;

        const updatedTask = await updateTodoListTask(active.id as string, { status: over.id as TodoListStatus });
        if (errorMessage === null && updatedTask !== undefined) {
            syncTaskInGroups(updatedTask);
        }
    }
}