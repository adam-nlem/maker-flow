import { useEffect, useRef } from "react";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Color, colorToBgClass } from "~/models/enums/Color";
import { useUpdateTodoListTag } from "../../hooks/todoListTags/useUpdateTodoListTag";
import type { TodoListTag } from "../../models/TodoListTag";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TrashIcon } from "@heroicons/react/24/outline";

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
        <div className="flex flex-col items-center gap-3 absolute left-full top-0 ml-2 z-20 bg-white border border-light-gray rounded-lg shadow-md min-w-max p-2">
            <Input
                ref={inputRef}
                placeholder="Tag"
                id="edit-tag-title"
                name="edit-tag-title"
                type="text"
                required
                fullWidth
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-row gap-2">
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
                size="xs"
                fullWidth
            >
                Enregistrer
            </Button>

            <SimpleTextButton onClick={() => { }}
                hoverColor={"hover:text-danger"} children={
                    <>
                        <TrashIcon className="size-3.5" strokeWidth={2} />
                        <p>Supprimer</p>
                    </>
                } />
        </div>
    );
}
