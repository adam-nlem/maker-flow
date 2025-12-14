import { Badge } from "~/components/ui/Badge";

import { ChevronLeftIcon, ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import type { TodoListTask } from "../models/TodoListTask";
import { todoListPriorityToTextClass, todoListPriorityToBgClass, todoListPriorityToFrenchTranslation } from "../models/enums/TodoListPriority";
import { colorToTextClass, colorToBgClass } from "~/models/enums/Color";



export default function TodoListTaskCard({ todoItem }: { todoItem: TodoListTask }) {
    return (<div className="border border-light-gray rounded-lg p-2 flex flex-col gap-3">
        <h1 className="text-sm">{todoItem.title}</h1>
        <div className="flex flex-col gap-1.5">

            {todoItem.tags.length > 0 &&
                <div className="flex flex-col gap-1">
                    {todoItem.tags.map((tag) =>
                        <Badge
                            icon={TagIcon} label={tag.title}
                            textColor={colorToTextClass[tag.color]}
                            bgColor={colorToBgClass[tag.color]} />)}
                </div>}

            {todoItem.priority &&
                <Badge
                    icon={ExclamationTriangleIcon}
                    label={todoListPriorityToFrenchTranslation[todoItem.priority]}
                    textColor={todoListPriorityToTextClass[todoItem.priority]}
                    bgColor={todoListPriorityToBgClass[todoItem.priority]} />}

            {todoItem.dueDate &&
                <Badge icon={CalendarDateRangeIcon} label={todoItem.dueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} />}
        </div>
    </div>);
}