import { useState } from "react";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptVoiceOver } from "~/models/ScriptVoiceOver";
import { VoiceOverType, voiceOverTypeToLabel, voiceOverTypeToBgClass, voiceOverTypeToTextClass } from "~/models/enums/VoiceOverType";
import { Pill } from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useUpdateScriptVoiceOver";
import { useDeleteScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useDeleteScriptVoiceOver";

interface Props {
    voiceOver: ScriptVoiceOver;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptVoiceOverCard({ voiceOver, scriptUuid, dragHandleProps }: Props) {
    const [content, setContent] = useState(voiceOver.content);
    const [voiceOverType, setVoiceOverType] = useState<VoiceOverType>(voiceOver.voiceOverType);

    const { updateScriptVoiceOver } = useUpdateScriptVoiceOver();
    const { deleteScriptVoiceOver, isPending: isDeleting } = useDeleteScriptVoiceOver();

    const handleContentBlur = async () => {
        if (content.trim() !== voiceOver.content) {
            await updateScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    const handleVoiceOverTypeChange = async (newType: VoiceOverType) => {
        setVoiceOverType(newType);
        if (newType !== voiceOver.voiceOverType) {
            await updateScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid, data: { voiceOverType: newType } });
        }
    };

    const pillColor = `${voiceOverTypeToBgClass[voiceOverType]} ${voiceOverTypeToTextClass[voiceOverType]}`;

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
                    <Pill text="Voix off" color={pillColor} />
                    <select
                        value={voiceOverType}
                        onChange={(e) => handleVoiceOverTypeChange(e.target.value as VoiceOverType)}
                        className="text-xs px-2 py-0.5 rounded-lg border-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                    >
                        {Object.values(VoiceOverType).map((type) => (
                            <option key={type} value={type}>{voiceOverTypeToLabel[type]}</option>
                        ))}
                    </select>
                </div>
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleContentBlur}
                    placeholder="Contenu de la voix off..."
                    textStyle="text-body-sm"
                    fullWidth
                />
            </div>
            <button
                onClick={() => deleteScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid })}
                disabled={isDeleting}
                className="shrink-0 mt-0.5 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
                <TrashIcon className="size-4" strokeWidth={2} />
            </button>
        </div>
    );
}
