import { Badge } from "~/components/ui/Badge";
import { useDraggable } from '@dnd-kit/core';
import { ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import type { TodoListTask } from "../../models/TodoListTask";
import { todoListPriorityToTextClass, todoListPriorityToBgClass, todoListPriorityToFrenchTranslation } from "../../models/enums/TodoListPriority";
import { colorToTextClass, colorToBgClass } from "~/models/enums/Color";

interface TodoListTaskCardProps {
    todoListUuid?: string;
    task: TodoListTask;
    onClick?: () => void;
    isDragDisabled?: boolean;
}

export default function TodoListTaskCard({ todoListUuid, task, onClick, isDragDisabled = false }: TodoListTaskCardProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.uuid,
        disabled: isDragDisabled,
    });

    return (
        <div
            className={`border bg-clear border-light-gray rounded-lg p-2 flex flex-col gap-3 cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
        >
            <h1 className="text-sm">{task.title}</h1>
            <div className="flex flex-col gap-1.5">

                {task.tags.length > 0 &&
                    <div className="flex flex-col gap-1">
                        {task.tags.map((tag) =>
                            <Badge
                                key={tag.uuid}
                                icon={TagIcon} label={tag.title}
                                textColor={colorToTextClass[tag.color]}
                                bgColor={colorToBgClass[tag.color]} />)}
                    </div>}

                {task.priority &&
                    <Badge
                        icon={ExclamationTriangleIcon}
                        label={todoListPriorityToFrenchTranslation[task.priority]}
                        textColor={todoListPriorityToTextClass[task.priority]}
                        bgColor={todoListPriorityToBgClass[task.priority]} />}

                {task.dueDate &&
                    <Badge icon={CalendarDateRangeIcon} label={task.dueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} />}
            </div>
        </div>
    );
}