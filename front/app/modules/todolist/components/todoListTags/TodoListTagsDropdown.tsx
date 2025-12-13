import { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { useListTodoListTagsWithSearch } from "../../hooks/todoListTags/useListTodoListTags";
import { TagIcon } from "@heroicons/react/16/solid";
import { colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCreateTodoListTag } from "../../hooks/todoListTags/useCreateTodoListTag";
import type { TodoListTag } from "../../models/TodoListTag";
import Shimmer from "~/components/ui/Shimmer";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import TodoListTagEditDropdown from "./TodoListTagEditDropdown";

interface TodoListTagsDropdownProps {
    todoListUuid: string;
    setShowTodoListTagsDropdown: (showTodoListTagsDropdown: boolean) => void;
    selectedTags: TodoListTag[];
    setSelectedTags: (selectedTags: TodoListTag[]) => void;
}

export default function TodoListTagsDropdown({ todoListUuid, setShowTodoListTagsDropdown, selectedTags, setSelectedTags }: TodoListTagsDropdownProps) {
    const { searchTerm, setSearchTerm, todoListTags, setTodoListTags, isLoading } = useListTodoListTagsWithSearch({ todoListUuid: todoListUuid });
    const { createTodoListTag } = useCreateTodoListTag({ todoListUuid: todoListUuid, title: searchTerm })
    const inputRef = useRef<HTMLInputElement>(null);
    const [editingTag, setEditingTag] = useState<TodoListTag | null>(null);

    // Auto-focus the search input when the dropdown opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleCreateTag = async () => {
        const newTag = await createTodoListTag()
        if (newTag !== undefined) {
            setSelectedTags([...selectedTags, newTag])
            setShowTodoListTagsDropdown(false)
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
                                        onClick={() => setSelectedTags([...selectedTags, tag])}
                                    />
                                    {editingTag?.uuid === tag.uuid && (
                                        <TodoListTagEditDropdown
                                            tag={tag}
                                            onClose={() => setEditingTag(null)}
                                            onTagUpdated={(updatedTag) => {
                                                setTodoListTags(todoListTags.map(t => t.uuid === updatedTag.uuid ? updatedTag : t));
                                            }}
                                        />
                                    )}
                                </div>
                            )

                    })}
                </div>
            )
        }

        if (searchTerm !== "") {
            return (
                <SimpleTextButton onClick={handleCreateTag} children={
                    <>
                        <PlusIcon className="size-3.5" strokeWidth={2} />
                        <p>{`Créer ${searchTerm}`}</p>
                    </>
                }
                />

            )
        }

        return <p className="text-body-xs">Commencez à écrire pour créer un nouveau tag.</p>
    }

    return (
        <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-0" onClick={() => setShowTodoListTagsDropdown(false)} />
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

                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {renderContent()}
            </div>
        </>
    );
}   