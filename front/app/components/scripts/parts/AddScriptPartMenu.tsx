import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ScriptPartType, scriptPartTypeOptions, scriptPartTypeToFrenchTranslation, scriptPartTypeToIcon } from "~/models/enums/ScriptPartType";
import { useCreateScriptChapter } from "~/hooks/api/scriptChapters/useCreateScriptChapter";
import { useCreateScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useCreateScriptVoiceOver";
import { useCreateScriptDialogue } from "~/hooks/api/scriptDialogues/useCreateScriptDialogue";
import { useCreateScriptShot } from "~/hooks/api/scriptShots/useCreateScriptShot";
import { useCreateScriptText } from "~/hooks/api/scriptTexts/useCreateScriptText";
import { useCreateScriptCallToAction } from "~/hooks/api/scriptCallToActions/useCreateScriptCallToAction";
import { useCreateScriptRetentionCue } from "~/hooks/api/scriptRetentionCues/useCreateScriptRetentionCue";
import { useCreateScriptHook } from "~/hooks/api/scriptHooks/useCreateScriptHook";
import { ChapterType } from "~/models/enums/ChapterType";
import { Tone } from "~/models/enums/Tone";
import { ShotType } from "~/models/enums/ShotType";
import { CallToActionType } from "~/models/enums/CallToActionType";
import { RetentionCueType } from "~/models/enums/RetentionCueType";

interface AddScriptPartMenuProps {
    scriptUuid: string;
    generationUuid?: string;
    hasHook: boolean;
}

export default function AddScriptPartMenu({ scriptUuid, generationUuid, hasHook }: AddScriptPartMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { createScriptChapter } = useCreateScriptChapter();
    const { createScriptVoiceOver } = useCreateScriptVoiceOver();
    const { createScriptDialogue } = useCreateScriptDialogue();
    const { createScriptShot } = useCreateScriptShot();
    const { createScriptText } = useCreateScriptText();
    const { createScriptCallToAction } = useCreateScriptCallToAction();
    const { createScriptRetentionCue } = useCreateScriptRetentionCue();
    const { createScriptHook } = useCreateScriptHook();

    const availableOptions = hasHook
        ? scriptPartTypeOptions.filter((type) => type !== ScriptPartType.Hook)
        : scriptPartTypeOptions;

    const handleAdd = async (type: ScriptPartType) => {
        setIsOpen(false);
        switch (type) {
            case ScriptPartType.Hook:
                await createScriptHook({ scriptUuid, content: "", generationUuid });
                break;
            case ScriptPartType.Text:
                await createScriptText({ scriptUuid, content: "", generationUuid });
                break;
            case ScriptPartType.Chapter:
                await createScriptChapter({ scriptUuid, title: "Nouveau chapitre", chapterType: ChapterType.OnScreen, generationUuid });
                break;
            case ScriptPartType.VoiceOver:
                await createScriptVoiceOver({ scriptUuid, content: "", tone: Tone.Neutral, generationUuid });
                break;
            case ScriptPartType.Dialogue:
                await createScriptDialogue({ scriptUuid, title: "Nouveau dialogue", generationUuid });
                break;
            case ScriptPartType.Shot:
                await createScriptShot({ scriptUuid, content: "", shotType: ShotType.ARoll, generationUuid });
                break;
            case ScriptPartType.CallToAction:
                await createScriptCallToAction({ scriptUuid, content: "", callToActionType: CallToActionType.Custom, generationUuid });
                break;
            case ScriptPartType.RetentionCue:
                await createScriptRetentionCue({ scriptUuid, content: "", retentionCueType: RetentionCueType.Question, generationUuid });
                break;
        }
    };

    return (
        <div className="relative">
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 z-30 border border-light-gray rounded-xl bg-clear shadow-lg p-1.5 flex flex-col gap-0.5 min-w-48">
                        {availableOptions.map((type) => {
                            const Icon = scriptPartTypeToIcon[type];
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleAdd(type)}
                                    className="flex flex-row items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-left cursor-pointer w-full"
                                >
                                    <Icon className="size-4 text-gray shrink-0" strokeWidth={2} />
                                    <span className="text-heading-sm">{scriptPartTypeToFrenchTranslation[type]}</span>
                                </button>
                            );
                        })}
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
