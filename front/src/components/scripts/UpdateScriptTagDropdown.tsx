import { useEffect, useRef, useState } from "react";
import { useFloating, offset, flip, shift, autoUpdate, useDismiss, useInteractions, FloatingPortal } from "@floating-ui/react"
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { colorOptions, colorToBgClass } from "~/models/enums/Color";
import { useUpdateScriptTag } from "~/hooks/api/scriptTags/useUpdateScriptTag";
import type { ScriptTag } from "~/models/ScriptTag";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteScriptTag } from "~/hooks/api/scriptTags/useDeleteScriptTag";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";

interface UpdateScriptTagDropdownProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    tag: ScriptTag;
    onClose: () => void;
    onTagDeleted: (deletedTagUuid: string) => void;
}

export default function UpdateScriptTagDropdown({ anchorRef, tag, onClose, onTagDeleted }: UpdateScriptTagDropdownProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(tag.title);
    const [color, setColor] = useState(tag.color);

    const { updateScriptTag, isPending: isUpdating } = useUpdateScriptTag();
    const { deleteScriptTag, isPending: isDeleting } = useDeleteScriptTag();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const { refs, floatingStyles, context } = useFloating({
        open: true,
        onOpenChange: (open) => { if (!open) onClose() },
        placement: "right-start",
        elements: { reference: anchorRef.current },
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })

    const dismiss = useDismiss(context)
    const { getFloatingProps } = useInteractions([dismiss])

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = async () => {
        await updateScriptTag({ tagUuid: tag.uuid, title, color });
        onClose();
    };

    return (
        <>
            <FloatingPortal>
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                    className="z-70 flex flex-col items-center gap-3 bg-clear border border-pale-gray rounded-lg shadow-md min-w-max p-2"
                >
                    <Input
                        ref={inputRef}
                        placeholder={t("scripts:tags.tagPlaceholder")}
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
                                className={`size-5 rounded cursor-pointer ${colorToBgClass[c]} ${color === c ? 'ring-2 ring-offset-1 ring-muted-2' : ''}`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isUpdating || title.trim() === ""}
                    >
                        {t("actions.save")}
                    </Button>

                    <SimpleTextButton
                        onClick={() => setShowDeleteConfirm(true)}
                        hoverColor={"hover:text-danger"}
                    >
                        <TrashIcon className="size-3.5" strokeWidth={2} />
                        <p>{t("scripts:tags.delete")}</p>
                    </SimpleTextButton>
                </div>
            </FloatingPortal>

            <ConfirmDeleteDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                    await deleteScriptTag(tag.uuid);
                    onTagDeleted(tag.uuid);
                    onClose();
                }}
                isPending={isDeleting}
                message={t("scripts:tags.deleteConfirm")}
            />
        </>
    );
}
