import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { useUpdateTodoList } from "../../hooks/todoLists/useUpdateTodoList";
import type { TodoList } from "../../models/TodoList";

interface UpdateTodoListHeaderProps {
    todoList?: TodoList;
    hideChevronLeft: boolean;
    isLastTodoList: boolean;
    onGoToPrevious: () => void;
    onGoToNext: () => void;
    onShowCreateTodoListModal: () => void;
}

export default function UpdateTodoListHeader({
    todoList,
    hideChevronLeft,
    isLastTodoList,
    onGoToPrevious,
    onGoToNext,
    onShowCreateTodoListModal: onShowCreateTodoListModal,
}: UpdateTodoListHeaderProps) {
    const { title, setTitle } = useUpdateTodoList({ todoList });

    return (
        <>
            {hideChevronLeft && (
                <ChevronLeftIcon
                    onClick={onGoToPrevious}
                    className="size-4 text-gray cursor-pointer hover:text-dark"
                    strokeWidth={2}
                />
            )}
            <Input
                placeholder="Aucune Liste"
                id="title"
                name="title"
                type="text"
                required
                simple
                textStyle="text-heading-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            {isLastTodoList ? (
                <PlusCircleIcon
                    onClick={onShowCreateTodoListModal}
                    className="size-4 text-gray cursor-pointer hover:text-dark"
                    strokeWidth={2}
                />
            ) : (
                <ChevronRightIcon
                    onClick={onGoToNext}
                    className="size-4 text-gray cursor-pointer hover:text-dark"
                    strokeWidth={2}
                />
            )}
        </>
    );
}
