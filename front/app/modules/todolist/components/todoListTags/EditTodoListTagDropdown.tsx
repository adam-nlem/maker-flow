import { useEffect, useRef } from "react";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Color, colorToBgClass } from "~/models/enums/Color";
import { useUpdateTodoListTag } from "../../hooks/todoListTags/useUpdateTodoListTag";
import type { TodoListTag } from "../../models/TodoListTag";

interface EditTodoListTagDropdownProps {
    tag: TodoListTag;
    onClose: () => void;
    onTagUpdated: (updatedTag: TodoListTag) => void;
}

export default function EditTodoListTagDropdown({ tag, onClose, onTagUpdated }: EditTodoListTagDropdownProps) {
    const { title, setTitle, color, setColor, isSubmitting, updateTodoListTag } = useUpdateTodoListTag({ tag });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = async () => {
        const updatedTag = await updateTodoListTag();
        if (updatedTag) {
            onTagUpdated(updatedTag);
            onClose();
        }
    };

    return (
        <div className="absolute left-full top-0 ml-2 z-20 bg-white border border-light-gray rounded-lg shadow-md min-w-max p-2">
            <Input
                ref={inputRef}
                placeholder="Tag"
                id="edit-tag-title"
                name="edit-tag-title"
                type="text"
                required
                fullWidth
                simple
                className="mb-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-row gap-2 mb-3">
                {Object.values(Color).map((c) => (
                    <div
                        key={c}
                        onClick={() => setColor(c)}
                        className={`size-5 rounded cursor-pointer ${colorToBgClass[c]} ${color === c ? 'ring-2 ring-offset-1 ring-gray' : ''}`}
                    />
                ))}
            </div>

            <Button
                onClick={handleSave}
                disabled={isSubmitting || title.trim() === ""}
                size="sm"
                fullWidth
            >
                Enregistrer
            </Button>
        </div>
    );
}
