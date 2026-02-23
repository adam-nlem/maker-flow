import { useState } from "react";
import { MicrophoneIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptVoiceOver } from "~/models/ScriptVoiceOver";
import { VoiceOverType, voiceOverTypeToLabel, voiceOverTypeToBgClass, voiceOverTypeToTextClass } from "~/models/enums/VoiceOverType";
import Pill from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useUpdateScriptVoiceOver";
import { useDeleteScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useDeleteScriptVoiceOver";
import ScriptPartHeader from "./ScriptPartHeader";

interface ScriptVoiceOverCardProps {
    voiceOver: ScriptVoiceOver;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptVoiceOverCard({ voiceOver, scriptUuid, dragHandleProps }: ScriptVoiceOverCardProps) {
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

    return (
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex-1 flex flex-col gap-2">
            <ScriptPartHeader icon={MicrophoneIcon} label="Voix off" colorClassName="bg-yellow/10 border border-yellow/30" dragHandleProps={dragHandleProps} />
            <div className="flex flex-row items-center gap-2">
                <SelectDropdown
                    items={Object.values(VoiceOverType)}
                    selectedItemId={voiceOverType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleVoiceOverTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={voiceOverTypeToLabel[voiceOverType]}
                            isSelected
                            bgColorClassName={voiceOverTypeToBgClass[voiceOverType]}
                            textColorClassName={voiceOverTypeToTextClass[voiceOverType]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={voiceOverTypeToLabel[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={voiceOverTypeToBgClass[item]}
                            textColorClassName={voiceOverTypeToTextClass[item]}
                        /> : null
                    }}
                />
                <button
                    onClick={() => deleteScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="shrink-0 mt-0.5 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
            </div>
            <TextArea
                simple
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleContentBlur}
                placeholder="Contenu de la voix off..."
                textStyle="text-sm"
                fullWidth
            />
        </div>
    );
}
