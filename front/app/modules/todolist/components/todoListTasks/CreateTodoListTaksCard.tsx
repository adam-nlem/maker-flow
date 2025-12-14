import { ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { Input } from "~/components/ui/Input";
import ListTodoListTagsDropdown from "../todoListTags/ListTodoListTagsDropdown";

import { useCreateTodoListTask } from "../../hooks/todoListTasks/useCreateTodoListTask";
import { colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import type { TodoListTag } from "../../models/TodoListTag";
import { TodoListPriority, todoListPriorityToBgClass, todoListPriorityToFrenchTranslation, todoListPriorityToTextClass } from "../../models/enums/TodoListPriority";
import AddTodoListPriorityDropdown from "../todoListPriority/AddTodoListPriorityDropdown";
import { Button } from "~/components/ui/Button";

export default function CreateTodoListTaskCard({ todoListUuid }: { todoListUuid: string }) {
    const {
        title, setTitle,
        priority, setPriority,
        status, setStatus,
        dueDate, setDueDate,
        tags, setTags,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTask,
    } = useCreateTodoListTask({ todoListUuid: todoListUuid })

    const [showTodoListTagsDropdown, setShowTodoListTagsDropdown] = useState(false);
    const [showTodoListPriorityDropdown, setShowTodoListPriorityDropdown] = useState(false);


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

                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />


            <SimpleTextButton onClick={() => setShowTodoListTagsDropdown(!showTodoListTagsDropdown)}>
                <TagIcon className="size-3.5" strokeWidth={2} />
                <p>Ajouter un tag</p>
            </SimpleTextButton>

            {showTodoListTagsDropdown && <ListTodoListTagsDropdown
                todoListUuid={todoListUuid}
                selectedTags={tags}
                onClose={() => setShowTodoListTagsDropdown(false)}
                onTagSelected={(selectedTag: TodoListTag) => {
                    setTags([...tags, selectedTag])
                }}
                onTagDeleted={(deletedTagUuid) => setTags(tags.filter(t => t.uuid !== deletedTagUuid))}
            />}

            {tags.length > 0 && tags.map((tag) =>
                <Badge
                    key={tag.uuid}
                    icon={TagIcon} label={tag.title}
                    textColor={colorToTextClass[tag.color]}
                    bgColor={colorToBgClass[tag.color]}
                    onRemoveClick={() => setTags(tags.filter(t => t.uuid !== tag.uuid))}
                />
            )}

            {priority !== null ? (
                <Badge
                    icon={ExclamationTriangleIcon}
                    label={todoListPriorityToFrenchTranslation[priority]}
                    textColor={todoListPriorityToTextClass[priority]}
                    bgColor={todoListPriorityToBgClass[priority]}
                    onRemoveClick={() => setPriority(null)}
                    onClick={() => setShowTodoListPriorityDropdown(!showTodoListPriorityDropdown)}
                />
            ) : (
                <SimpleTextButton onClick={() => setShowTodoListPriorityDropdown(!showTodoListPriorityDropdown)}>
                    <ExclamationTriangleIcon className="size-3.5" strokeWidth={2} />
                    <p>Ajouter une priorité</p>
                </SimpleTextButton>
            )}

            {showTodoListPriorityDropdown && (
                <AddTodoListPriorityDropdown
                    selectedPriority={priority}
                    onClose={() => setShowTodoListPriorityDropdown(false)}
                    onPrioritySelected={(selectedPriority) => setPriority(selectedPriority)}
                />
            )}
            <SimpleTextButton onClick={() => { }}>
                <CalendarDateRangeIcon className="size-3.5" strokeWidth={2} />
                <p>Ajouter une date</p>
            </SimpleTextButton>

            {title !== "" && <Button
                onClick={createTodoListTask}
                disabled={isSubmitting || title.trim() === ""}
                size="xs"
                fullWidth
            >
                Créer
            </Button>}
        </div>
    );
}