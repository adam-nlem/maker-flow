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
    onTodoListUdated: (todoList: TodoList) => void;
}

export default function UpdateTodoListHeader({
    todoList,
    hideChevronLeft,
    isLastTodoList,
    onGoToPrevious,
    onGoToNext,
    onShowCreateTodoListModal,
    onTodoListUdated

}: UpdateTodoListHeaderProps) {
    const { title, setTitle } = useUpdateTodoList({ todoList: todoList, onTodoListUdated: onTodoListUdated });

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
                size={Math.max(title.length, 12)}   // 12ch minimum
                className="inline-block w-auto min-w-32 max-w-50"
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
