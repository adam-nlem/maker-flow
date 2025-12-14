import { Badge } from "~/components/ui/Badge";

import { ChevronLeftIcon, ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import type { TodoListTask } from "../models/TodoListTask";
import { todoListPriorityToTextClass, todoListPriorityToBgClass, todoListPriorityToFrenchTranslation } from "../models/enums/TodoListPriority";
import { colorToTextClass, colorToBgClass } from "~/models/enums/Color";



export default function TodoListTaskCard({ task }: { task: TodoListTask }) {
    return (<div className="border border-light-gray rounded-lg p-2 flex flex-col gap-3 cursor-pointer">
        <h1 className="text-sm">{task.title}</h1>
        <div className="flex flex-col gap-1.5">

            {task.tags.length > 0 &&
                <div className="flex flex-col gap-1">
                    {task.tags.map((tag) =>
                        <Badge
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
    </div>);
}