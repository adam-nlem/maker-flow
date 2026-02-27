import { useState } from "react";
import type { ScriptChapter } from "~/models/ScriptChapter";
import { ChapterType, chapterTypeToFrenchTranslation, chapterTypeToBgClass, chapterTypeToTextClass } from "~/models/enums/ChapterType";
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
}

export default function ScriptChapterCard({ chapter, scriptUuid, dragHandleProps }: ScriptChapterCardProps) {
    const [title, setTitle] = useState(chapter.title);
    const [description, setDescription] = useState(chapter.description ?? "");
    const [chapterType, setChapterType] = useState<ChapterType>(chapter.chapterType);

    const { updateScriptChapter } = useUpdateScriptChapter();
    const { deleteScriptChapter, isPending: isDeleting } = useDeleteScriptChapter();

    const handleTitleBlur = async () => {
        if (title.trim() !== chapter.title) {
            await updateScriptChapter({ chapterUuid: chapter.uuid, scriptUuid, data: { title: title.trim() } });
        }
    };

    const handleDescriptionBlur = async () => {
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
            onDelete={() => deleteScriptChapter({ chapterUuid: chapter.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            <SelectDropdown
                items={Object.values(ChapterType)}
                selectedItemId={chapterType}
                getItemId={(type) => type}
                onSelect={(type) => handleChapterTypeChange(type)}
                renderTrigger={({ onClick }) => (
                    <Pill
                        onClick={onClick}
                        label={chapterTypeToFrenchTranslation[chapterType]}
                        isSelected
                        bgColorClassName={chapterTypeToBgClass[chapterType]}
                        textColorClassName={chapterTypeToTextClass[chapterType]}
                    />
                )}
                renderItem={({ item, isSelected, onSelect }) => {
                    return !isSelected ? <Pill
                        label={chapterTypeToFrenchTranslation[item]}
                        isSelected
                        onClick={onSelect}
                        bgColorClassName={chapterTypeToBgClass[item]}
                        textColorClassName={chapterTypeToTextClass[item]}
                    /> : null
                }}
            />
            <Input
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Titre du chapitre"
                textStyle="text-heading-md"
                fullWidth
            />
            <TextArea
                simple
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Description (optionnel)"
                textStyle="text-sm"
                fullWidth
            />
        </ScriptPartCard>
    );
}
