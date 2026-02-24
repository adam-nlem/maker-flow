import { useState } from "react";
import type { ScriptVoiceOver } from "~/models/ScriptVoiceOver";
import { VoiceOverType, voiceOverTypeToLabel, voiceOverTypeToBgClass, voiceOverTypeToTextClass } from "~/models/enums/VoiceOverType";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import Pill from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useUpdateScriptVoiceOver";
import { useDeleteScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useDeleteScriptVoiceOver";
import ScriptPartCard from "./ScriptPartCard";

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
        <ScriptPartCard
            partType={ScriptPartType.VoiceOver}
            dragHandleProps={dragHandleProps}
            onDelete={() => deleteScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
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
            <TextArea
                simple
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleContentBlur}
                placeholder="Contenu de la voix off..."
                textStyle="text-sm"
                fullWidth
            />
        </ScriptPartCard>
    );
}
