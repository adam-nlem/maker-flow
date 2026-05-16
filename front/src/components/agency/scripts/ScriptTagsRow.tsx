import { useEffect, useRef, useState } from "react";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Script } from "~/models/Script";
import type { ScriptTag } from "~/models/ScriptTag";
import { colorToBgClass, colorToBorderClass, colorToTextClass } from "~/models/enums/Color";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import Pill from "~/components/ui/Pill";
import ListScriptTagsDropdown from "./ListScriptTagsDropdown";

interface Props {
    script: Script;
    projectUuid: string;
    isReadOnly?: boolean;
}

export default function ScriptTagsRow({ script, projectUuid, isReadOnly }: Props) {
    const { t } = useTranslation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [localTags, setLocalTags] = useState<ScriptTag[]>(script.tags);
    const pendingMutations = useRef(0);
    const tagPillRef = useRef<HTMLDivElement>(null);

    const { updateScript } = useUpdateScript();

    // Sync local state from server when no mutations are in flight
    useEffect(() => {
        if (pendingMutations.current === 0) {
            setLocalTags(script.tags);
        }
    }, [script.tags]);

    const updateTags = async (newTags: ScriptTag[]) => {
        const previousTags = localTags;
        setLocalTags(newTags);
        pendingMutations.current++;

        try {
            await updateScript({ scriptUuid: script.uuid, data: { tagUuids: newTags.map(t => t.uuid) } });
        } catch {
            setLocalTags(previousTags);
        } finally {
            pendingMutations.current--;
        }
    };

    const handleTagSelected = (selectedTag: ScriptTag) =>
        updateTags([...localTags, selectedTag]);

    const handleRemoveTag = (tagUuid: string) =>
        updateTags(localTags.filter(t => t.uuid !== tagUuid));

    const handleTagDeleted = (deletedTagUuid: string) => {
        setLocalTags(localTags.filter(t => t.uuid !== deletedTagUuid));
    };

    return (
        <div className="flex flex-row flex-wrap items-center gap-2">
            {localTags.map((tag) => (
                <Pill
                    key={tag.uuid}
                    label={tag.title}
                    isSelected
                    bgColorClassName={colorToBgClass[tag.color]}
                    borderColorClassName={colorToBorderClass[tag.color]}
                    textColorClassName={colorToTextClass[tag.color]}
                    suffixIcon={isReadOnly ? undefined : XMarkIcon}
                    onSuffixClick={isReadOnly ? undefined : () => handleRemoveTag(tag.uuid)}
                />
            ))}

            {!isReadOnly && (
                <div ref={tagPillRef}>
                    <Pill
                        onClick={() => setShowDropdown(!showDropdown)}
                        icon={TagIcon}
                        label={t("scripts:tags.tagPlaceholder")}
                    />
                    {showDropdown && (
                        <ListScriptTagsDropdown
                            anchorRef={tagPillRef}
                            projectUuid={projectUuid}
                            selectedTags={localTags}
                            onClose={() => setShowDropdown(false)}
                            onTagSelected={handleTagSelected}
                            onTagDeleted={handleTagDeleted}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
