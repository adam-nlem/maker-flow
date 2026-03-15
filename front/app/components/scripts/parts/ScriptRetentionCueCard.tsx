import { useState } from "react";
import type { ScriptRetentionCue } from "~/models/ScriptRetentionCue";
import { RetentionCueType, retentionCueTypeOptions, retentionCueTypeToFrenchTranslation, retentionCueTypeToBgClass, retentionCueTypeToBorderClass, retentionCueTypeToTextClass } from "~/models/enums/RetentionCueType";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import Pill from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptRetentionCue } from "~/hooks/api/scriptRetentionCues/useUpdateScriptRetentionCue";
import { useDeleteScriptRetentionCue } from "~/hooks/api/scriptRetentionCues/useDeleteScriptRetentionCue";
import ScriptPartCard from "./ScriptPartCard";

interface ScriptRetentionCueCardProps {
    retentionCue: ScriptRetentionCue;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
    isReadOnly?: boolean;
}

export default function ScriptRetentionCueCard({ retentionCue, scriptUuid, dragHandleProps, isReadOnly }: ScriptRetentionCueCardProps) {
    const [content, setContent] = useState(retentionCue.content);
    const [retentionCueType, setRetentionCueType] = useState<RetentionCueType>(retentionCue.retentionCueType);

    const { updateScriptRetentionCue } = useUpdateScriptRetentionCue();
    const { deleteScriptRetentionCue, isPending: isDeleting } = useDeleteScriptRetentionCue();

    const handleContentBlur = async () => {
        if (isReadOnly) return;
        if (content.trim() !== retentionCue.content) {
            await updateScriptRetentionCue({ retentionCueUuid: retentionCue.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    const handleRetentionCueTypeChange = async (newType: RetentionCueType) => {
        setRetentionCueType(newType);
        if (newType !== retentionCue.retentionCueType) {
            await updateScriptRetentionCue({ retentionCueUuid: retentionCue.uuid, scriptUuid, data: { retentionCueType: newType } });
        }
    };

    return (
        <ScriptPartCard
            partType={ScriptPartType.RetentionCue}
            dragHandleProps={dragHandleProps}
            onDelete={isReadOnly ? undefined : () => deleteScriptRetentionCue({ retentionCueUuid: retentionCue.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            {isReadOnly ? (
                <Pill
                    label={retentionCueTypeToFrenchTranslation[retentionCueType]}
                    isSelected
                    bgColorClassName={retentionCueTypeToBgClass[retentionCueType]}
                    borderColorClassName={retentionCueTypeToBorderClass[retentionCueType]}
                    textColorClassName={retentionCueTypeToTextClass[retentionCueType]}
                />
            ) : (
                <SelectDropdown
                    items={retentionCueTypeOptions}
                    selectedItemId={retentionCueType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleRetentionCueTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={retentionCueTypeToFrenchTranslation[retentionCueType]}
                            isSelected
                            bgColorClassName={retentionCueTypeToBgClass[retentionCueType]}
                            borderColorClassName={retentionCueTypeToBorderClass[retentionCueType]}
                            textColorClassName={retentionCueTypeToTextClass[retentionCueType]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={retentionCueTypeToFrenchTranslation[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={retentionCueTypeToBgClass[item]}
                            borderColorClassName={retentionCueTypeToBorderClass[item]}
                            textColorClassName={retentionCueTypeToTextClass[item]}
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
                placeholder="Contenu du signal de rétention..."
                textStyle="text-sm"
            />
        </ScriptPartCard>
    );
}
