import { Badge } from "~/components/ui/Badge";

import { ChevronLeftIcon, ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import type { TodoItem } from "../models/TodoItem";
import { todoPriorityToTextClass, todoPriorityToBgClass, todoPriorityToFrenchTranslation } from "../models/enums/TodoPriority";
import { colorToTextClass, colorToBgClass } from "~/models/enums/Color";



export default function TodoItemCard({ todoItem }: { todoItem: TodoItem }) {
    return (<div className="border border-light-gray rounded-lg p-2 flex flex-col gap-3">
        <h1 className="text-sm">{todoItem.title}</h1>
        <div className="flex flex-col gap-1.5">

            {todoItem.categories.length > 0 &&
                <div className="flex flex-col gap-1">
                    {todoItem.categories.map((category) =>
                        <Badge
                            icon={TagIcon} label={category.title}
                            textColor={colorToTextClass[category.color]}
                            bgColor={colorToBgClass[category.color]} />)}
                </div>}

            {todoItem.priority &&
                <Badge
                    icon={ExclamationTriangleIcon}
                    label={todoPriorityToFrenchTranslation[todoItem.priority]}
                    textColor={todoPriorityToTextClass[todoItem.priority]}
                    bgColor={todoPriorityToBgClass[todoItem.priority]} />}

            {todoItem.dueDate &&
                <Badge icon={CalendarDateRangeIcon} label={todoItem.dueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} />}
        </div>
    </div>);
}