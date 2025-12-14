import { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { useListTodoListTagsWithSearch } from "../../hooks/todoListTags/useListTodoListTagsWithSearch";
import { TagIcon } from "@heroicons/react/16/solid";
import { Color, colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCreateTodoListTag } from "../../hooks/todoListTags/useCreateTodoListTag";
import type { TodoListTag } from "../../models/TodoListTag";
import Shimmer from "~/components/ui/Shimmer";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import EditTodoListTagDropdown from "./EditTodoListTagDropdown";

interface ListTodoListTagsDropdownProps {
    todoListUuid: string;
    selectedTags: TodoListTag[];
    onClose: () => void;
    onTagSelected: (selectedTag: TodoListTag) => void;
    onTagDeleted?: (deletedTagUuid: string) => void;
}

export default function ListTodoListTagsDropdown({ todoListUuid, selectedTags, onClose, onTagSelected, onTagDeleted }: ListTodoListTagsDropdownProps) {
    const { searchTerm, setSearchTerm, todoListTags, setTodoListTags, isLoading } = useListTodoListTagsWithSearch({ todoListUuid: todoListUuid });
    const { title, setTitle, color, setColor, createTodoListTag } = useCreateTodoListTag({ todoListUuid: todoListUuid })
    const [editingTag, setEditingTag] = useState<TodoListTag | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the search input when the dropdown opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleCreateTag = async () => {
        const newTag = await createTodoListTag()
        if (newTag !== undefined) {
            onTagSelected(newTag)
            onClose()
        }
    }

    const renderContent = () => {
        if (isLoading) return null

        if (todoListTags.length > 0) {
            return (
                <div className="flex flex-col gap-1">
                    {todoListTags.map((tag) => {
                        if (!selectedTags.some(t => t.uuid === tag.uuid))
                            return (
                                <div key={tag.uuid} className="relative">
                                    <Badge
                                        icon={TagIcon}
                                        label={tag.title}
                                        textColor={colorToTextClass[tag.color]}
                                        bgColor={colorToBgClass[tag.color]}
                                        onOptionClick={() => setEditingTag(tag)}
                                        onClick={() => onTagSelected(tag)}
                                    />
                                    {editingTag?.uuid === tag.uuid && (
                                        <EditTodoListTagDropdown
                                            tag={tag}
                                            onClose={() => setEditingTag(null)}
                                            onTagUpdated={(updatedTag) => {
                                                setTodoListTags(todoListTags.map(t => t.uuid === updatedTag.uuid ? updatedTag : t));
                                            }}
                                            onTagDeleted={(deletedTagUuid) => {
                                                setTodoListTags(todoListTags.filter(t => t.uuid !== deletedTagUuid));
                                                onTagDeleted?.(deletedTagUuid);
                                            }}
                                        />
                                    )}
                                </div>
                            )

                    })}
                </div>
            )
        }

        if (title !== "") {
            return (<div>
                <div className="flex flex-row gap-2 mb-3">
                    {Object.values(Color).map((c) => (
                        <div
                            key={c}
                            onClick={() => setColor(c)}
                            className={`size-5 rounded cursor-pointer ${colorToBgClass[c]} ${color === c ? 'ring-2 ring-offset-1 ring-gray' : ''}`}
                        />
                    ))}
                </div>
                <SimpleTextButton onClick={handleCreateTag} children={
                    <>
                        <PlusIcon className="size-3.5" strokeWidth={2} />
                        <p>{`Créer ${title}`}</p>
                    </>
                }
                />
            </div>

            )
        }

        return <p className="text-body-xs">Commencez à écrire pour créer un nouveau tag.</p>
    }

    return (
        <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-0" onClick={onClose} />
            <div className="absolute top-14 left-0 mt-1 z-10 bg-white border border-light-gray rounded-lg shadow-md min-w-max p-2 text-center">
                <Input
                    ref={inputRef}
                    placeholder="Tag"
                    id="title"
                    name="title"
                    type="text"
                    required
                    fullWidth
                    simple

                    className="mb-3"

                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        setSearchTerm(e.target.value)
                    }}
                />

                {renderContent()}
            </div>
        </>
    );
}   