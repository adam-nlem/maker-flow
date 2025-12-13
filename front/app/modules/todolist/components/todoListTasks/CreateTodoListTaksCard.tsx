import { ExclamationTriangleIcon, TagIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { Input } from "~/components/ui/Input";
import TodoListTagsDropdown from "../todoListTags/TodoListTagsDropdown";

import { useCreateTodoListTask } from "../../hooks/todoListTasks/useCreateTodoListTask";
import { colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import SimpleTextButton from "~/components/ui/SimpleTextButton";

export default function CreateTodoListTaskCard({ todoListUuid }: { todoListUuid: string }) {
    const [showTodoListTagsDropdown, setShowTodoListTagsDropdown] = useState(false);
    const {
        title, setTitle,
        content, setContent,
        priority, setPriority,
        status, setStatus,
        dueDate, setDueDate,
        tags, setTags,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTask,
    } = useCreateTodoListTask({ todoListUuid: todoListUuid })

    return (
        <div className="border border-light-gray rounded-lg p-2 flex flex-col gap-3 relative">
            <Input
                placeholder="Titre"
                id="title"
                name="title"
                type="text"
                required
                fullWidth
                simple

            // value={name}
            // onChange={(e) => setName(e.target.value)}
            />


            <SimpleTextButton onClick={() => setShowTodoListTagsDropdown(!showTodoListTagsDropdown)} children={
                <>
                    <TagIcon className="size-3.5" strokeWidth={2} />
                    <p>Ajouter un tag</p>
                </>
            } />
                {showTodoListTagsDropdown && <TodoListTagsDropdown todoListUuid={todoListUuid} setShowTodoListTagsDropdown={setShowTodoListTagsDropdown} selectedTags={tags} setSelectedTags={setTags} />}

                {tags.length > 0 && tags.map((tag) => <div className="flex flex-row justify-between">
                    <Badge
                        key={tag.uuid}
                        icon={TagIcon} label={tag.title}
                        textColor={colorToTextClass[tag.color]}
                        bgColor={colorToBgClass[tag.color]}
                    />

                    <XMarkIcon className="size-3.5 text-danger cursor-pointer" strokeWidth={2} onClick={() => setTags(tags.filter(t => t.uuid !== tag.uuid))} />
                </div>)}
            <Badge
                icon={ExclamationTriangleIcon} label="Priorité"
                textColor="text-gray"
                bgColor="bg-gray/30" />
        </div>
    );
}