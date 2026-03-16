import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Color, colorOptions, colorToBgClass } from "~/models/enums/Color";
import { useUpdateScriptTag } from "~/hooks/api/scriptTags/useUpdateScriptTag";
import type { ScriptTag } from "~/models/ScriptTag";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteScriptTag } from "~/hooks/api/scriptTags/useDeleteScriptTag";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";

interface UpdateScriptTagDropdownProps {
    tag: ScriptTag;
    onClose: () => void;
    onTagDeleted: (deletedTagUuid: string) => void;
}

export default function UpdateScriptTagDropdown({ tag, onClose, onTagDeleted }: UpdateScriptTagDropdownProps) {
    const [title, setTitle] = useState(tag.title);
    const [color, setColor] = useState(tag.color);

    const { updateScriptTag, isPending: isUpdating } = useUpdateScriptTag();
    const { deleteScriptTag, isPending: isDeleting } = useDeleteScriptTag();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = async () => {
        await updateScriptTag({ tagUuid: tag.uuid, title, color });
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
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-row gap-2">
                {colorOptions.map((c) => (
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

            <SimpleTextButton
                onClick={() => setShowDeleteConfirm(true)}
                hoverColor={"hover:text-danger"}
            >
                <TrashIcon className="size-3.5" strokeWidth={2} />
                <p>Supprimer</p>
            </SimpleTextButton>

            <ConfirmDeleteDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                    await deleteScriptTag(tag.uuid);
                    onTagDeleted(tag.uuid);
                    onClose();
                }}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer ce tag ? Cette action est irréversible."
            />
        </div>
    );
}
