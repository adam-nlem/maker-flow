import type { Project } from "~/models/Project";
import type { ReactNode } from "react";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";
import type { TodoList } from "../../models/TodoList";

interface TodoListTileProps {
    todoList: TodoList;
    showCreatedAt?: boolean;
    rightIcon?: ReactNode;
    onClick?: () => void;
}

export default function TodoListTile({
    todoList,
    showCreatedAt = false,
    rightIcon,
    onClick
}: TodoListTileProps) {
    return (

        <div
            className="flex flex-row justify-between gap-3 items-center hover:bg-light-gray cursor-pointer rounded-md p-2"
            onClick={onClick}
        >
            <div className="flex flex-row gap-3 ">
                <div className="flex flex-col">
                    <h1 className="text-heading-sm whitespace-nowrap">{todoList.title}</h1>
                    {showCreatedAt && (
                        <p className="text-body-xs text-gray whitespace-nowrap">Créé le {formatToFrenchDateShort(todoList.createdAt)}</p>
                    )}
                </div>
            </div>
            {rightIcon}
        </div>

    );
}
