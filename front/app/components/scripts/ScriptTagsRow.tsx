import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import type { ScriptTag } from "~/models/ScriptTag";
import { colorToBgClass, colorToTextClass, Color } from "~/models/enums/Color";
import { useListScriptTags } from "~/hooks/api/scriptTags/useListScriptTags";
import { useCreateScriptTag } from "~/hooks/api/scriptTags/useCreateScriptTag";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { Input } from "~/components/ui/Input";

interface Props {
    script: Script;
    projectUuid: string;
}

export default function ScriptTagsRow({ script, projectUuid }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTagTitle, setNewTagTitle] = useState("");
    const [newTagColor, setNewTagColor] = useState<Color>(Color.Blue);

    const { scriptTags: allTags } = useListScriptTags({ projectUuid });

    console.log("all tags", allTags);
    const { createScriptTag, isPending: isCreating } = useCreateScriptTag();
    const { updateScript } = useUpdateScript();

    const assignedUuids = new Set(script.tags.map((t) => t.uuid));

    const handleToggleTag = async (tag: ScriptTag) => {
        const isAssigned = assignedUuids.has(tag.uuid);
        const newTagUuids = isAssigned
            ? script.tags.filter((t) => t.uuid !== tag.uuid).map((t) => t.uuid)
            : [...script.tags.map((t) => t.uuid), tag.uuid];
        await updateScript({ scriptUuid: script.uuid, data: { tagUuids: newTagUuids } });
    };

    const handleRemoveTag = async (tagUuid: string) => {
        const newTagUuids = script.tags.filter((t) => t.uuid !== tagUuid).map((t) => t.uuid);
        await updateScript({ scriptUuid: script.uuid, data: { tagUuids: newTagUuids } });
    };

    const handleCreateTag = async () => {
        if (!newTagTitle.trim()) return;
        await createScriptTag({ projectUuid, title: newTagTitle.trim(), color: newTagColor });
        setNewTagTitle("");
        setIsOpen(false);
    };

    return (
        <div className="flex flex-row flex-wrap items-center gap-2">
            {script.tags.map((tag) => (
                <div
                    key={tag.uuid}
                    className={`flex flex-row items-center gap-1 px-2 py-0.5 rounded-md ${colorToBgClass[tag.color]}`}
                >
                    <span className={`text-heading-xs ${colorToTextClass[tag.color]}`}>{tag.title}</span>
                    <button
                        onClick={() => handleRemoveTag(tag.uuid)}
                        className={`${colorToTextClass[tag.color]} hover:opacity-70 transition-opacity cursor-pointer`}
                    >
                        <XMarkIcon className="size-3" strokeWidth={2.5} />
                    </button>
                </div>
            ))}

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-row items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-light-gray text-gray hover:border-gray hover:text-dark transition-colors cursor-pointer"
                >
                    <PlusIcon className="size-3" strokeWidth={2.5} />
                    <span className="text-heading-xs">Tag</span>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                        <div className="absolute top-full left-0 mt-1 z-30 border border-light-gray rounded-xl bg-clear shadow-lg p-3 flex flex-col gap-2 min-w-52">
                            {/* Existing tags */}
                            {allTags.filter((t) => !assignedUuids.has(t.uuid)).map((tag) => (
                                <button
                                    key={tag.uuid}
                                    onClick={() => { handleToggleTag(tag); setIsOpen(false); }}
                                    className={`flex flex-row items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors text-left w-full cursor-pointer`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${colorToBgClass[tag.color]}`} />
                                    <span className="text-heading-sm">{tag.title}</span>
                                </button>
                            ))}

                            {/* Create new tag */}
                            <div className="border-t border-light-gray pt-2 flex flex-col gap-2">
                                <Input
                                    simple
                                    value={newTagTitle}
                                    onChange={(e) => setNewTagTitle(e.target.value)}
                                    placeholder="Nouveau tag..."
                                    fullWidth
                                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateTag(); }}
                                />
                                <div className="flex flex-row gap-1.5 flex-wrap">
                                    {Object.values(Color).map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewTagColor(color)}
                                            className={`w-5 h-5 rounded-full ${colorToBgClass[color]} cursor-pointer ${newTagColor === color ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleCreateTag}
                                    disabled={isCreating || !newTagTitle.trim()}
                                    className="text-heading-xs text-primary hover:text-primary/80 disabled:opacity-50 cursor-pointer text-left"
                                >
                                    {isCreating ? "Création..." : "Créer le tag"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
