import { ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { Input } from "~/components/ui/Input";
import ListTodoListTagsDropdown from "../todoListTags/ListTodoListTagsDropdown";

import { useCreateTodoListTask } from "../../hooks/todoListTasks/useCreateTodoListTask";
import { colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import type { TodoListTag } from "../../models/TodoListTag";
import { todoListPriorityToBgClass, todoListPriorityToFrenchTranslation, todoListPriorityToTextClass, selectTodoListPriorityDropdownOptions } from "../../models/enums/TodoListPriority";
import SelectEnumDropdown from "~/components/ui/SelectEnumDropdown";
import AddDueDateDropdown from "./AddDueDateDropdown";
import { Button } from "~/components/ui/Button";
import type { TodoListTask } from "../../models/TodoListTask";

interface CreateTodoListTaskCardProps {
    todoListUuid: string;
    onTaskCreated: (task: TodoListTask) => void;
}

export default function CreateTodoListTaskCard({ todoListUuid, onTaskCreated }: CreateTodoListTaskCardProps) {
    const {
        title, setTitle,
        priority, setPriority,
        dueDate, setDueDate,
        tags, setTags,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTask,
    } = useCreateTodoListTask({ todoListUuid: todoListUuid })

    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);

    return (
        <div className="border border-light-gray rounded-lg p-2 flex flex-col gap-3">
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

            <SimpleTextButton onClick={() => setShowTagsDropdown(!showTagsDropdown)}>
                <TagIcon className="size-3.5" strokeWidth={2} />
                <p>Ajouter un tag</p>
            </SimpleTextButton>

            {showTagsDropdown && <ListTodoListTagsDropdown
                todoListUuid={todoListUuid}
                selectedTags={tags}
                onClose={() => setShowTagsDropdown(false)}
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

            {priority ? (
                <Badge
                    icon={ExclamationTriangleIcon}
                    label={todoListPriorityToFrenchTranslation[priority]}
                    textColor={todoListPriorityToTextClass[priority]}
                    bgColor={todoListPriorityToBgClass[priority]}
                    onRemoveClick={() => setPriority(undefined)}
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                />
            ) : (
                <SimpleTextButton onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}>
                    <ExclamationTriangleIcon className="size-3.5" strokeWidth={2} />
                    <p>Ajouter une priorité</p>
                </SimpleTextButton>
            )}

            {showPriorityDropdown && (
                <SelectEnumDropdown
                    selectedValue={priority}
                    options={selectTodoListPriorityDropdownOptions}
                    onClose={() => setShowPriorityDropdown(false)}
                    onSelect={(selectedPriority) => {
                        setPriority(selectedPriority);
                        setShowPriorityDropdown(false);
                    }}
                />
            )}
            {dueDate ? (
                <Badge
                    icon={CalendarDateRangeIcon}
                    label={dueDate.toLocaleDateString('fr-FR')}
                    textColor="text-gray"
                    onRemoveClick={() => setDueDate(undefined)}
                    onClick={() => setShowDueDateDropdown(!showDueDateDropdown)}
                />
            ) : (
                <SimpleTextButton onClick={() => setShowDueDateDropdown(!showDueDateDropdown)}>
                    <CalendarDateRangeIcon className="size-3.5" strokeWidth={2} />
                    <p>Ajouter une date</p>
                </SimpleTextButton>
            )}

            {showDueDateDropdown && (
                <AddDueDateDropdown
                    selectedDueDate={dueDate}
                    onClose={() => setShowDueDateDropdown(false)}
                    onDueDateSelected={(selectedDate) => setDueDate(selectedDate)}
                />
            )}

            {title !== "" && <Button
                onClick={async () => {
                    const createdTask = await createTodoListTask()
                    if (createdTask && errorMessage === null) {
                        onTaskCreated(createdTask)
                    }
                }}
                disabled={isSubmitting || title.trim() === ""}
                size="xs"
                fullWidth
            >
                Créer
            </Button>}
        </div>
    );
}