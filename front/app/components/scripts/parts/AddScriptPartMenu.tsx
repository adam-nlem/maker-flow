import { useState } from "react";
import { PlusIcon, DocumentTextIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, FilmIcon } from "@heroicons/react/24/outline";
import { useCreateScriptChapter } from "~/hooks/api/scriptChapters/useCreateScriptChapter";
import { useCreateScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useCreateScriptVoiceOver";
import { useCreateScriptDialogue } from "~/hooks/api/scriptDialogues/useCreateScriptDialogue";
import { useCreateScriptShot } from "~/hooks/api/scriptShots/useCreateScriptShot";
import { ChapterType } from "~/models/enums/ChapterType";
import { VoiceOverType } from "~/models/enums/VoiceOverType";
import { ShotType } from "~/models/enums/ShotType";

interface Props {
    scriptUuid: string;
}

const PART_OPTIONS = [
    { key: "chapter", label: "Chapitre", icon: DocumentTextIcon },
    { key: "voice_over", label: "Voix off", icon: MicrophoneIcon },
    { key: "dialogue", label: "Dialogue", icon: ChatBubbleLeftRightIcon },
    { key: "shot", label: "Plan", icon: FilmIcon },
] as const;

type PartKey = typeof PART_OPTIONS[number]["key"];

export default function AddScriptPartMenu({ scriptUuid }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const { createScriptChapter } = useCreateScriptChapter();
    const { createScriptVoiceOver } = useCreateScriptVoiceOver();
    const { createScriptDialogue } = useCreateScriptDialogue();
    const { createScriptShot } = useCreateScriptShot();

    const handleAdd = async (key: PartKey) => {
        setIsOpen(false);
        switch (key) {
            case "chapter":
                await createScriptChapter({ scriptUuid, title: "Nouveau chapitre", chapterType: ChapterType.OnScreen });
                break;
            case "voice_over":
                await createScriptVoiceOver({ scriptUuid, content: "", voiceOverType: VoiceOverType.Neutral });
                break;
            case "dialogue":
                await createScriptDialogue({ scriptUuid, title: "Nouveau dialogue" });
                break;
            case "shot":
                await createScriptShot({ scriptUuid, content: "", shotType: ShotType.ARoll });
                break;
        }
    };

    return (
        <div className="relative">
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 z-30 border border-light-gray rounded-xl bg-clear shadow-lg p-1.5 flex flex-col gap-0.5 min-w-48">
                        {PART_OPTIONS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => handleAdd(key)}
                                className="flex flex-row items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left cursor-pointer w-full"
                            >
                                <Icon className="size-4 text-gray shrink-0" strokeWidth={2} />
                                <span className="text-heading-sm">{label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-row items-center gap-2 px-4 py-2.5 border border-light-gray rounded-xl bg-clear hover:bg-surface-hover transition-colors text-gray hover:text-dark cursor-pointer w-full"
            >
                <PlusIcon className="size-4 shrink-0" strokeWidth={2} />
                <span className="text-heading-sm">Ajouter un élément</span>
            </button>
        </div>
    );
}
