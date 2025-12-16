import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { useCreateTodoList } from "../../hooks/todoLists/useCreateTodoList";
import type { TodoList } from "../../models/TodoList";

interface CreateTodoListHeaderProps {
    userModuleUuid: string;
    onCancel: () => void;
    onTodoListCreated: (todoList: TodoList) => void;
}

export default function CreateTodoListHeader({
    userModuleUuid,
    onCancel,
    onTodoListCreated,
}: CreateTodoListHeaderProps) {
    const { title, setTitle, createTodoList, resetForm, errorMessage } = useCreateTodoList({ userModuleUuid });

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    return (
        <>
            <XMarkIcon
                onClick={handleCancel}
                className="size-4 text-gray cursor-pointer hover:text-danger"
                strokeWidth={2}
            />
            <Input
                placeholder="Nouvelle Todo List"
                id="title"
                name="title"
                type="text"
                required
                simple
                textStyle="text-heading-md"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <CheckIcon
                onClick={async () => {
                    const newTodoList = await createTodoList();
                    if (newTodoList && errorMessage === null) {
                        onTodoListCreated(newTodoList);
                    }
                }}
                className="size-4 text-gray cursor-pointer hover:text-primary"
                strokeWidth={2}
            />
        </>
    );
}
