import type { Project } from "~/models/Project";
import { useState, type ReactNode } from "react";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";
import type { TodoList } from "../../models/TodoList";

interface TodoListTileProps {
    todoList: TodoList;
    isSelected?: boolean;
    showCreatedAt?: boolean;
    rightIcon?: ReactNode;
    onHoverRightIcon?: ReactNode;
    onClick?: () => void;
}

export default function TodoListTile({
    todoList,
    isSelected = false,
    showCreatedAt = false,
    rightIcon,
    onHoverRightIcon,
    onClick
}: TodoListTileProps) {
    const [isHovered, setIsHovered] = useState(false)
    return (

        <div
            className="flex flex-row justify-between gap-3 items-center hover:bg-light-gray cursor-pointer rounded-md p-2"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >

            <div className="flex flex-row gap-3 items-center ">
                {isSelected && <div className="h-1 w-1 rounded-full bg-primary"></div>}
                <div className="flex flex-col">
                    <h1 className="text-heading-sm whitespace-nowrap">{todoList.title}</h1>
                    {showCreatedAt && (
                        <p className="text-body-xs text-gray whitespace-nowrap">Créé le {formatToFrenchDateShort(todoList.createdAt)}</p>
                    )}
                </div>
            </div>
            {isHovered && onHoverRightIcon}
            {rightIcon}
        </div>

    );
}
