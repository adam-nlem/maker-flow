import { Badge } from "~/components/ui/Badge";
import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { TodoListPriority, todoListPriorityToBgClass, todoListPriorityToFrenchTranslation, todoListPriorityToTextClass } from "../../models/enums/TodoListPriority";

interface AddTodoListPriorityDropdownProps {
    selectedPriority: TodoListPriority | null;
    onClose: () => void;
    onPrioritySelected: (selectedPriority: TodoListPriority) => void;
}

export default function AddTodoListPriorityDropdown({ selectedPriority, onClose, onPrioritySelected }: AddTodoListPriorityDropdownProps) {

    return (
        <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-0" onClick={onClose} />
            <div className="absolute top-14 left-0 mt-1 z-10 bg-white border border-light-gray rounded-lg shadow-md min-w-max p-2 text-center">
                <div className="flex flex-col gap-1">
                    {Object.values(TodoListPriority).map((priority) => {
                        if (selectedPriority !== priority)
                            return (

                                <Badge
                                    key={priority}
                                    icon={ExclamationTriangleIcon}
                                    label={todoListPriorityToFrenchTranslation[priority]}
                                    textColor={todoListPriorityToTextClass[priority]}
                                    bgColor={todoListPriorityToBgClass[priority]}
                                    onClick={() => onPrioritySelected(priority)}
                                />
                            )

                    })}
                </div>
            </div>
        </>
    );
}   