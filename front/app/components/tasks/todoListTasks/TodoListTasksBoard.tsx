import { DndContext, DragOverlay, PointerSensor, type DragEndEvent, type DragStartEvent, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import type { TodoListTasksGroupedByStatusDTO } from "~/dtos/TodoListTasksGroupedByStatusDTO";
import type { TodoListTask } from "~/models/TodoListTask";
import { TodoListStatus } from "~/models/enums/TodoListStatus";
import TodoListStatusColumn from "./TodoListStatusColumn";
import TodoListTaskCard from "./TodoListTaskCard";

interface TodoListTasksBoardProps {
    todoListUuid?: string;
    taskGroups: TodoListTasksGroupedByStatusDTO[];
    paginationByStatus: Record<TodoListStatus, { page: number; hasMore: boolean; }>;
    isLoading: boolean;
    onLoadMore: (status: TodoListStatus) => void;
    onTaskClick: (task: TodoListTask) => void;
    getTaskByUuid: (taskUuid: string) => TodoListTask | undefined;
    onTaskMoved: (taskUuid: string, status: TodoListStatus) => Promise<void> | void;
}

export default function TodoListTasksBoard({
    todoListUuid,
    taskGroups,
    paginationByStatus,
    isLoading,
    onLoadMore,
    onTaskClick,
    getTaskByUuid,
    onTaskMoved,
}: TodoListTasksBoardProps) {
    const [draggedTask, setDraggedTask] = useState<TodoListTask | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = getTaskByUuid(event.active.id as string);
        setDraggedTask(task ?? null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { over, active } = event;
        setDraggedTask(null);
        if (!over) return;

        await onTaskMoved(active.id as string, over.id as TodoListStatus);
    };

    const handleDragCancel = () => setDraggedTask(null);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            {Object.values(TodoListStatus).map((status) => (
                <TodoListStatusColumn
                    key={status}
                    status={status}
                    tasks={taskGroups.find(dto => dto.status === status)?.todoListTasks ?? []}
                    hasMore={paginationByStatus[status].hasMore}
                    isLoading={isLoading}
                    todoListUuid={todoListUuid}
                    onLoadMore={() => onLoadMore(status)}
                    onTaskClick={onTaskClick}
                />
            ))}
            <DragOverlay dropAnimation={null}>
                {draggedTask && <TodoListTaskCard task={draggedTask} isDragDisabled />}
            </DragOverlay>
        </DndContext>
    );
}
