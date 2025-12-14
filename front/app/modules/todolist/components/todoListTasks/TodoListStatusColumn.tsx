import { ArrowPathIcon } from "@heroicons/react/24/outline";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TodoListStatus, todoListStatusToBgClass, todoListStatusToFrenchTranslation, todoListStatusToTextClass } from "../../models/enums/TodoListStatus";
import type { TodoListTask } from "../../models/TodoListTask";
import CreateTodoListTaskCard from "./CreateTodoListTaksCard";
import TodoListTaskCard from "./TodoListTaskCard";
import { useDroppable } from "@dnd-kit/core";
import Shimmer from "~/components/ui/Shimmer";

interface TodoListStatusColumnProps {
    status: TodoListStatus;
    tasks: TodoListTask[];
    hasMore: boolean;
    isLoading: boolean;
    todoListUuid: string | undefined;
    onLoadMore: () => void;
    onTaskUpdated: (task: TodoListTask) => void;
}

export default function TodoListStatusColumn({ status, tasks, hasMore, isLoading, todoListUuid, onLoadMore, onTaskUpdated }: TodoListStatusColumnProps) {
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
                            {tasks.map((task) => <TodoListTaskCard todoListUuid={todoListUuid!} key={task.uuid} task={task} onTaskUpdated={onTaskUpdated} />)}

                            {hasMore && <SimpleTextButton onClick={onLoadMore}>
                                <ArrowPathIcon className="size-3.5" strokeWidth={2} />
                                <p>Charger plus de tâches</p>
                            </SimpleTextButton>}

                            {todoListUuid && <CreateTodoListTaskCard todoListUuid={todoListUuid} />}
                        </>
                    )}

                </div>
                {/* Bottom Fade to smooth the scroll */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none" />
            </div>

        </div>
    );
}
