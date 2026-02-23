import { useState } from "react";
import { BookOpenIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptChapter } from "~/models/ScriptChapter";
import { ChapterType, chapterTypeToLabel, chapterTypeToBgClass, chapterTypeToTextClass } from "~/models/enums/ChapterType";
import Pill from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptChapter } from "~/hooks/api/scriptChapters/useUpdateScriptChapter";
import { useDeleteScriptChapter } from "~/hooks/api/scriptChapters/useDeleteScriptChapter";
import ScriptPartHeader from "./ScriptPartHeader";

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
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex-1 flex flex-col gap-2">

            <ScriptPartHeader icon={BookOpenIcon} label="Chapitre" colorClassName="bg-blue/10 border border-blue/30" dragHandleProps={dragHandleProps} />
            <div className="flex flex-row items-center gap-2">

                <SelectDropdown
                    items={Object.values(ChapterType)}
                    selectedItemId={chapterType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleChapterTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={chapterTypeToLabel[chapterType]}
                            isSelected
                            bgColorClassName={chapterTypeToBgClass[chapterType]}
                            textColorClassName={chapterTypeToTextClass[chapterType]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={chapterTypeToLabel[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={chapterTypeToBgClass[item]}
                            textColorClassName={chapterTypeToTextClass[item]}
                        /> : null
                    }}
                />

                <button
                    onClick={() => deleteScriptChapter({ chapterUuid: chapter.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="shrink-0 mt-0.5 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
            </div>
            <Input
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Titre du chapitre"
                textStyle="text-heading-sm"
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
        </div>
    );
}
