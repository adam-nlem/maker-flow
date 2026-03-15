import { useState } from "react";
import type { ScriptChapter } from "~/models/ScriptChapter";
import { ChapterType, chapterTypeOptions, chapterTypeToFrenchTranslation, chapterTypeToBgClass, chapterTypeToBorderClass, chapterTypeToTextClass } from "~/models/enums/ChapterType";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import Pill from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptChapter } from "~/hooks/api/scriptChapters/useUpdateScriptChapter";
import { useDeleteScriptChapter } from "~/hooks/api/scriptChapters/useDeleteScriptChapter";
import ScriptPartCard from "./ScriptPartCard";

interface ScriptChapterCardProps {
    chapter: ScriptChapter;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
    isReadOnly?: boolean;
}

export default function ScriptChapterCard({ chapter, scriptUuid, dragHandleProps, isReadOnly }: ScriptChapterCardProps) {
    const [title, setTitle] = useState(chapter.title);
    const [description, setDescription] = useState(chapter.description ?? "");
    const [chapterType, setChapterType] = useState<ChapterType>(chapter.chapterType);

    const { updateScriptChapter } = useUpdateScriptChapter();
    const { deleteScriptChapter, isPending: isDeleting } = useDeleteScriptChapter();

    const handleTitleBlur = async () => {
        if (isReadOnly) return;
        if (title.trim() !== chapter.title) {
            await updateScriptChapter({ chapterUuid: chapter.uuid, scriptUuid, data: { title: title.trim() } });
        }
    };

    const handleDescriptionBlur = async () => {
        if (isReadOnly) return;
        if (description.trim() !== (chapter.description ?? "")) {
            await updateScriptChapter({ chapterUuid: chapter.uuid, scriptUuid, data: { description: description.trim() || undefined } });
        }
    };

    const handleChapterTypeChange = async (newType: ChapterType) => {
        setChapterType(newType);
        if (newType !== chapter.chapterType) {
            await updateScriptChapter({ chapterUuid: chapter.uuid, scriptUuid, data: { chapterType: newType } });
        }
    };

    return (
        <ScriptPartCard
            partType={ScriptPartType.Chapter}
            dragHandleProps={dragHandleProps}
            onDelete={isReadOnly ? undefined : () => deleteScriptChapter({ chapterUuid: chapter.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            {isReadOnly ? (
                <Pill
                    label={chapterTypeToFrenchTranslation[chapterType]}
                    isSelected
                    bgColorClassName={chapterTypeToBgClass[chapterType]}
                    borderColorClassName={chapterTypeToBorderClass[chapterType]}
                    textColorClassName={chapterTypeToTextClass[chapterType]}
                />
            ) : (
                <SelectDropdown
                    items={chapterTypeOptions}
                    selectedItemId={chapterType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleChapterTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={chapterTypeToFrenchTranslation[chapterType]}
                            isSelected
                            bgColorClassName={chapterTypeToBgClass[chapterType]}
                            borderColorClassName={chapterTypeToBorderClass[chapterType]}
                            textColorClassName={chapterTypeToTextClass[chapterType]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={chapterTypeToFrenchTranslation[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={chapterTypeToBgClass[item]}
                            borderColorClassName={chapterTypeToBorderClass[item]}
                            textColorClassName={chapterTypeToTextClass[item]}
                        /> : null
                    }}
                />
            )}
            <Input
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                readOnly={isReadOnly}
                placeholder="Titre du chapitre"
                textStyle="text-heading-md"
            />
            <TextArea
                simple
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                readOnly={isReadOnly}
                placeholder="Description (optionnel)"
                textStyle="text-sm"
            />
        </ScriptPartCard>
    );
}
