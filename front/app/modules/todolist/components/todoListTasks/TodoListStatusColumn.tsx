import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TodoListStatus, todoListStatusToBgClass, todoListStatusToFrenchTranslation, todoListStatusToTextClass } from "../../models/enums/TodoListStatus";
import type { TodoListTask } from "../../models/TodoListTask";
import CreateTodoListTaskCard from "./CreateTodoListTaksCard";
import TodoListTaskCard from "./TodoListTaskCard";
import { useDroppable } from "@dnd-kit/core";
import Shimmer from "~/components/ui/Shimmer";
import { useState } from "react";

interface TodoListStatusColumnProps {
    status: TodoListStatus;
    tasks: TodoListTask[];
    hasMore: boolean;
    isLoading: boolean;
    todoListUuid: string | undefined;
    onLoadMore: () => void;
    onTaskClick: (task: TodoListTask) => void;
    onTaskCreated: (task: TodoListTask) => void;
}

export default function TodoListStatusColumn({ status, tasks, hasMore, isLoading, todoListUuid, onLoadMore, onTaskClick, onTaskCreated }: TodoListStatusColumnProps) {
    const [showCreateTaskCard, setShowCreateTaskCard] = useState(false)

    const { isOver, setNodeRef } = useDroppable({ id: status });

    return (
        <div className="flex flex-col w-1/3 gap-3 min-h-0" ref={setNodeRef}>

            <div className={`text-sm w-full rounded-sm text-center ${todoListStatusToTextClass[status]} ${todoListStatusToBgClass[status]} shrink-0`}>
                {todoListStatusToFrenchTranslation[status]}
            </div>

            <div className="relative flex-1 min-h-0">

                <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-none h-full pb-5">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Shimmer key={i} height="h-20" />
                        ))
                    ) : (
                        <>

                            {status === TodoListStatus.Pending && todoListUuid && (
                                showCreateTaskCard ?
                                <CreateTodoListTaskCard todoListUuid={todoListUuid} onTaskCreated={onTaskCreated} /> :
                                <SimpleTextButton onClick={() => setShowCreateTaskCard(true)}>
                                    <PlusIcon className="size-3.5" strokeWidth={2} />
                                    <p>Nouvelle tâche</p>
                                </SimpleTextButton>
                            )}

                            {tasks.map((task) => <TodoListTaskCard key={task.uuid} task={task} onClick={() => onTaskClick(task)} />)}

                            {hasMore && <SimpleTextButton onClick={onLoadMore}>
                                <ArrowPathIcon className="size-3.5" strokeWidth={2} />
                                <p>Charger plus de tâches</p>
                            </SimpleTextButton>}
                        </>
                    )}

                </div>
                {/* Bottom Fade to smooth the scroll */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none" />
            </div>

        </div>
    );
}
