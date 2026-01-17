import { ExclamationTriangleIcon, TagIcon, CalendarDateRangeIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { Input } from "~/components/ui/Input";
import ListTodoListTagsDropdown from "../todoListTags/ListTodoListTagsDropdown";

import { useCreateTodoListTask } from "../../hooks/api/todoListTasks/useCreateTodoListTask";
import { colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import type { TodoListTag } from "../../models/TodoListTag";
import { todoListPriorityToBgClass, todoListPriorityToFrenchTranslation, todoListPriorityToTextClass } from "../../models/enums/TodoListPriority";
import { TodoListPriority } from "../../models/enums/TodoListPriority";
import AddDueDateDropdown from "./AddDueDateDropdown";
import { Button } from "~/components/ui/Button";
import SelectDropdown from "~/components/ui/SelectDropdown";

interface CreateTodoListTaskCardProps {
    todoListUuid: string;
    onTaskCreated: () => void;
}

const todoListPriorityOptions = Object.values(TodoListPriority);


export default function CreateTodoListTaskCard({ todoListUuid, onTaskCreated }: CreateTodoListTaskCardProps) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<TodoListPriority | undefined>(undefined);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [tags, setTags] = useState<TodoListTag[]>([]);

    const { createTodoListTask, isPending } = useCreateTodoListTask({ todoListUuid })

    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);

    const resetForm = () => {
        setTitle("");
        setPriority(undefined);
        setDueDate(undefined);
        setTags([]);
    };

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

            <SelectDropdown<TodoListPriority>
                items={todoListPriorityOptions}
                selectedItemId={priority}
                getItemId={(item) => item}
                onSelect={(item) => setPriority(item)}
                renderTrigger={({ onClick }) => (

                    priority ? (
                        <Badge
                            icon={ExclamationTriangleIcon}
                            label={todoListPriorityToFrenchTranslation[priority]}
                            textColor={todoListPriorityToTextClass[priority]}
                            bgColor={todoListPriorityToBgClass[priority]}
                            onRemoveClick={() => setPriority(undefined)}
                            onClick={onClick}
                        />
                    ) : (
                        <SimpleTextButton onClick={onClick}>
                            <ExclamationTriangleIcon className="size-3.5" strokeWidth={2} />
                            <p>Ajouter une priorité</p>
                        </SimpleTextButton>
                    )
                )}
                renderItem={({ item, isSelected, onSelect }) => (
                    <Badge
                        icon={ExclamationTriangleIcon}
                        label={todoListPriorityToFrenchTranslation[item]}
                        textColor={todoListPriorityToTextClass[item]}
                        bgColor={todoListPriorityToBgClass[item]}
                        onRemoveClick={() => setPriority(undefined)}
                        onClick={onSelect}
                    />
                )}
            />

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
                    await createTodoListTask({ title, priority, dueDate, tags });
                    resetForm();
                    onTaskCreated();
                }}
                disabled={isPending || title.trim() === ""}
            >
                Créer
            </Button>}
        </div>
    );
}