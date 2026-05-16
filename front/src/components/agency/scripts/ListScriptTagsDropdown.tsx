import { useEffect, useRef, useState } from "react";
import { useFloating, offset, flip, shift, autoUpdate, useDismiss, useInteractions, FloatingPortal } from "@floating-ui/react"
import { useTranslation } from "react-i18next";
import Pill from "~/components/ui/Pill";
import { useListScriptTagsWithSearch } from "~/hooks/api/scriptTags/useListScriptTagsWithSearch";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Color, colorOptions, colorToBgClass, colorToBorderClass, colorToTextClass } from "~/models/enums/Color";
import { Input } from "~/components/ui/Input";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCreateScriptTag } from "~/hooks/api/scriptTags/useCreateScriptTag";
import type { ScriptTag } from "~/models/ScriptTag";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import UpdateScriptTagDropdown from "./UpdateScriptTagDropdown";

interface ListScriptTagsDropdownProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    projectUuid: string;
    selectedTags: ScriptTag[];
    onClose: () => void;
    onTagSelected: (selectedTag: ScriptTag) => void;
    onTagDeleted?: (deletedTagUuid: string) => void;
}

export default function ListScriptTagsDropdown({ anchorRef, projectUuid, selectedTags, onClose, onTagSelected, onTagDeleted }: ListScriptTagsDropdownProps) {
    const { t } = useTranslation();
    const { setSearchTerm, scriptTags, isLoading } = useListScriptTagsWithSearch({ projectUuid: projectUuid });
    const [title, setTitle] = useState("");
    const [color, setColor] = useState(Color.Purple);
    const { createScriptTag } = useCreateScriptTag({ projectUuid: projectUuid })
    const [updatingTag, setUpdatingTag] = useState<ScriptTag | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const tagAnchorRefs = useRef<Map<string, HTMLElement>>(new Map())

    const { refs, floatingStyles, context } = useFloating({
        open: true,
        onOpenChange: (open) => { if (!open) onClose() },
        placement: "bottom-start",
        elements: { reference: anchorRef.current },
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })

    const dismiss = useDismiss(context)
    const { getFloatingProps } = useInteractions([dismiss])

    // Auto-focus the search input when the dropdown opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleCreateTag = async () => {
        const newTag = await createScriptTag({ title, color });
        onTagSelected(newTag);
        onClose();
    }

    const renderContent = () => {
        if (isLoading) return null

        if (scriptTags.length > 0) {
            return (
                <div className="flex flex-col gap-1">
                    {scriptTags.map((tag) => {
                        if (!selectedTags.some(t => t.uuid === tag.uuid))
                            return (
                                <div key={tag.uuid} ref={(el) => {
                                    if (el) tagAnchorRefs.current.set(tag.uuid, el)
                                    else tagAnchorRefs.current.delete(tag.uuid)
                                }}>
                                    <Pill
                                        isSelected
                                        label={tag.title}
                                        textColorClassName={colorToTextClass[tag.color]}
                                        bgColorClassName={colorToBgClass[tag.color]}
                                        borderColorClassName={colorToBorderClass[tag.color]}
                                        suffixIcon={EllipsisHorizontalIcon}
                                        onSuffixClick={() => setUpdatingTag(tag)}
                                        onClick={() => onTagSelected(tag)}
                                    />
                                    {updatingTag?.uuid === tag.uuid && tagAnchorRefs.current.get(tag.uuid) && (
                                        <UpdateScriptTagDropdown
                                            anchorRef={{ current: tagAnchorRefs.current.get(tag.uuid) ?? null }}
                                            tag={tag}
                                            onClose={() => setUpdatingTag(null)}
                                            onTagDeleted={(deletedTagUuid) => {
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
                    {colorOptions.map((c) => (
                        <div
                            key={c}
                            onClick={() => setColor(c)}
                            className={`size-5 rounded cursor-pointer ${colorToBgClass[c]} ${color === c ? 'ring-2 ring-offset-1 ring-muted-2' : ''}`}
                        />
                    ))}
                </div>
                <SimpleTextButton onClick={handleCreateTag} children={
                    <>
                        <PlusIcon className="size-3.5" strokeWidth={2} />
                        <p>{t("scripts:tags.createPrefix", { title })}</p>
                    </>
                }
                />
            </div>

            )
        }

        return <p className="text-body-xs">{t("scripts:tags.emptyHint")}</p>
    }

    return (
        <FloatingPortal>
            <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-70 bg-clear border border-pale-gray rounded-lg shadow-md min-w-max p-2 text-center"
            >
                <Input
                    ref={inputRef}
                    placeholder={t("scripts:tags.tagPlaceholder")}
                    id="title"
                    name="title"
                    type="text"
                    required
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
        </FloatingPortal>
    );
}
