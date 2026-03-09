import { useEffect, useRef, useState } from "react";
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
    projectUuid: string;
    selectedTags: ScriptTag[];
    onClose: () => void;
    onTagSelected: (selectedTag: ScriptTag) => void;
    onTagDeleted?: (deletedTagUuid: string) => void;
}

export default function ListScriptTagsDropdown({ projectUuid, selectedTags, onClose, onTagSelected, onTagDeleted }: ListScriptTagsDropdownProps) {
    const { searchTerm, setSearchTerm, scriptTags, isLoading } = useListScriptTagsWithSearch({ projectUuid: projectUuid });
    const [title, setTitle] = useState("");
    const [color, setColor] = useState(Color.Purple);
    const { createScriptTag } = useCreateScriptTag({ projectUuid: projectUuid })
    const [updatingTag, setUpdatingTag] = useState<ScriptTag | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

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
                                <div key={tag.uuid} className="relative">
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
                                    {updatingTag?.uuid === tag.uuid && (
                                        <UpdateScriptTagDropdown
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
            <div className="absolute top-14 left-0 mt-1 z-10 bg-clear border border-light-gray rounded-lg shadow-md min-w-max p-2 text-center">
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
