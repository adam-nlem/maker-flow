import { useState } from "react";
import { Bars3Icon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptChapter } from "~/models/ScriptChapter";
import { ChapterType, chapterTypeToLabel, chapterTypeToBgClass, chapterTypeToTextClass } from "~/models/enums/ChapterType";
import { Pill } from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useUpdateScriptChapter } from "~/hooks/api/scriptChapters/useUpdateScriptChapter";
import { useDeleteScriptChapter } from "~/hooks/api/scriptChapters/useDeleteScriptChapter";

interface Props {
    chapter: ScriptChapter;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptChapterCard({ chapter, scriptUuid, dragHandleProps }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chapter.title);
    const [description, setDescription] = useState(chapter.description ?? "");
    const [chapterType, setChapterType] = useState<ChapterType>(chapter.chapterType);

    const { updateScriptChapter, isPending: isUpdating } = useUpdateScriptChapter();
    const { deleteScriptChapter, isPending: isDeleting } = useDeleteScriptChapter();

    const handleSave = async () => {
        await updateScriptChapter({ chapterUuid: chapter.uuid, scriptUuid, data: { title, description: description || undefined, chapterType } });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTitle(chapter.title);
        setDescription(chapter.description ?? "");
        setChapterType(chapter.chapterType);
        setIsEditing(false);
    };

    const pillColor = `${chapterTypeToBgClass[chapterType]} ${chapterTypeToTextClass[chapterType]}`;

    if (isEditing) {
        return (
            <div className="border border-light-gray rounded-xl p-4 bg-clear flex flex-col gap-3">
                <div className="flex flex-row items-center gap-2">
                    <Pill text="Chapitre" color={pillColor} />
                </div>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre du chapitre"
                    fullWidth
                />
                <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optionnel)"
                    fullWidth
                />
                <select
                    value={chapterType}
                    onChange={(e) => setChapterType(e.target.value as ChapterType)}
                    className="rounded-xl border border-light-gray px-3 py-1.5 text-sm bg-clear focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    {Object.values(ChapterType).map((type) => (
                        <option key={type} value={type}>{chapterTypeToLabel[type]}</option>
                    ))}
                </select>
                <div className="flex flex-row gap-3">
                    <SimpleTextButton onClick={handleSave} color="text-primary" hoverColor="hover:text-primary">
                        {isUpdating ? "Enregistrement..." : "Enregistrer"}
                    </SimpleTextButton>
                    <SimpleTextButton onClick={handleCancel}>Annuler</SimpleTextButton>
                </div>
            </div>
        );
    }

    return (
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex flex-row items-start gap-3 hover:border-gray transition-colors">
            <div
                {...dragHandleProps}
                className="shrink-0 mt-0.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            >
                <Bars3Icon className="size-4" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex flex-row items-center gap-2">
                    <Pill text="Chapitre" color={pillColor} />
                    <Pill text={chapterTypeToLabel[chapter.chapterType]} color={pillColor} />
                </div>
                <p className="text-heading-sm truncate">{chapter.title}</p>
                {chapter.description && (
                    <p className="text-body-sm text-gray line-clamp-2">{chapter.description}</p>
                )}
            </div>
            <div className="flex flex-row gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray hover:text-dark transition-colors cursor-pointer"
                >
                    <PencilSquareIcon className="size-4" strokeWidth={2} />
                </button>
                <button
                    onClick={() => deleteScriptChapter({ chapterUuid: chapter.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="text-gray hover:text-danger transition-colors cursor-pointer"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
