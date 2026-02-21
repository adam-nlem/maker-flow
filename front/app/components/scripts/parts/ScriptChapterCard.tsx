import { useState } from "react";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptChapter } from "~/models/ScriptChapter";
import { ChapterType, chapterTypeToLabel, chapterTypeToBgClass, chapterTypeToTextClass } from "~/models/enums/ChapterType";
import { Pill } from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScriptChapter } from "~/hooks/api/scriptChapters/useUpdateScriptChapter";
import { useDeleteScriptChapter } from "~/hooks/api/scriptChapters/useDeleteScriptChapter";

interface Props {
    chapter: ScriptChapter;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptChapterCard({ chapter, scriptUuid, dragHandleProps }: Props) {
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

    const pillColor = `${chapterTypeToBgClass[chapterType]} ${chapterTypeToTextClass[chapterType]}`;

    return (
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex flex-row items-start gap-3">
            <div
                {...dragHandleProps}
                className="shrink-0 mt-0.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            >
                <Bars3Icon className="size-4" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <Pill text="Chapitre" color={pillColor} />
                    <select
                        value={chapterType}
                        onChange={(e) => handleChapterTypeChange(e.target.value as ChapterType)}
                        className="text-xs px-2 py-0.5 rounded-lg border-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                    >
                        {Object.values(ChapterType).map((type) => (
                            <option key={type} value={type}>{chapterTypeToLabel[type]}</option>
                        ))}
                    </select>
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
                    textStyle="text-body-sm"
                    fullWidth
                />
            </div>
            <button
                onClick={() => deleteScriptChapter({ chapterUuid: chapter.uuid, scriptUuid })}
                disabled={isDeleting}
                className="shrink-0 mt-0.5 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
                <TrashIcon className="size-4" strokeWidth={2} />
            </button>
        </div>
    );
}
