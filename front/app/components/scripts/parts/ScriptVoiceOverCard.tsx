import { useState } from "react";
import type { ScriptVoiceOver } from "~/models/ScriptVoiceOver";
import { Tone, toneOptions, toneToFrenchTranslation, toneToBgClass, toneToTextClass } from "~/models/enums/Tone";
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
    isReadOnly?: boolean;
}

export default function ScriptVoiceOverCard({ voiceOver, scriptUuid, dragHandleProps, isReadOnly }: ScriptVoiceOverCardProps) {
    const [content, setContent] = useState(voiceOver.content);
    const [tone, setTone] = useState<Tone>(voiceOver.tone);

    const { updateScriptVoiceOver } = useUpdateScriptVoiceOver();
    const { deleteScriptVoiceOver, isPending: isDeleting } = useDeleteScriptVoiceOver();

    const handleContentBlur = async () => {
        if (isReadOnly) return;
        if (content.trim() !== voiceOver.content) {
            await updateScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    const handleToneChange = async (newTone: Tone) => {
        setTone(newTone);
        if (newTone !== voiceOver.tone) {
            await updateScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid, data: { tone: newTone } });
        }
    };

    return (
        <ScriptPartCard
            partType={ScriptPartType.VoiceOver}
            dragHandleProps={dragHandleProps}
            onDelete={isReadOnly ? undefined : () => deleteScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            {isReadOnly ? (
                <Pill
                    label={toneToFrenchTranslation[tone]}
                    isSelected
                    bgColorClassName={toneToBgClass[tone]}
                    textColorClassName={toneToTextClass[tone]}
                />
            ) : (
                <SelectDropdown
                    items={toneOptions}
                    selectedItemId={tone}
                    getItemId={(type) => type}
                    onSelect={(type) => handleToneChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={toneToFrenchTranslation[tone]}
                            isSelected
                            bgColorClassName={toneToBgClass[tone]}
                            textColorClassName={toneToTextClass[tone]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={toneToFrenchTranslation[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={toneToBgClass[item]}
                            textColorClassName={toneToTextClass[item]}
                        /> : null
                    }}
                />
            )}
            <TextArea
                simple
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleContentBlur}
                readOnly={isReadOnly}
                placeholder="Contenu de la voix off..."
                textStyle="text-sm"
            />
        </ScriptPartCard>
    );
}
