import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Color, colorToBgClass } from "~/models/enums/Color";
import { useUpdateTodoListTag } from "../../hooks/api/todoListTags/useUpdateTodoListTag";
import type { TodoListTag } from "../../models/TodoListTag";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteTodoListTag } from "../../hooks/api/todoListTags/useDeleteTodoListTag";

interface UpdateTodoListTagDropdownProps {
    tag: TodoListTag;
    onClose: () => void;
    onTagDeleted: (deletedTagUuid: string) => void;
}

export default function UpdateTodoListTagDropdown({ tag, onClose, onTagDeleted }: UpdateTodoListTagDropdownProps) {
    const [title, setTitle] = useState(tag.title);
    const [color, setColor] = useState(tag.color);

    const { updateTodoListTag, isPending: isUpdating } = useUpdateTodoListTag();
    const { deleteTodoListTag, isPending: isDeleting } = useDeleteTodoListTag();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = async () => {
        await updateTodoListTag({ tagUuid: tag.uuid, title, color });
        onClose();
    };

    return (
        <div className="flex flex-col items-center gap-3 absolute left-full top-0 ml-2 z-20 bg-clear border border-light-gray rounded-lg shadow-md min-w-max p-2">
            <Input
                ref={inputRef}
                placeholder="Tag"
                id="title"
                name="title"
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
                disabled={isUpdating || title.trim() === ""}
            >
                Enregistrer
            </Button>

            <SimpleTextButton onClick={async () => {
                await deleteTodoListTag(tag.uuid);
                onTagDeleted(tag.uuid);
                onClose();
            }}
                hoverColor={"hover:text-danger"} children={
                    <>
                        <TrashIcon className="size-3.5" strokeWidth={2} />
                        <p>Supprimer</p>
                    </>
                } />
        </div>
    );
}
