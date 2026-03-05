import { useState } from "react";
import type { ScriptCallToAction } from "~/models/ScriptCallToAction";
import { CallToActionType, callToActionTypeOptions, callToActionTypeToFrenchTranslation, callToActionTypeToBgClass, callToActionTypeToTextClass } from "~/models/enums/CallToActionType";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import Pill from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptCallToAction } from "~/hooks/api/scriptCallToActions/useUpdateScriptCallToAction";
import { useDeleteScriptCallToAction } from "~/hooks/api/scriptCallToActions/useDeleteScriptCallToAction";
import ScriptPartCard from "./ScriptPartCard";

interface ScriptCallToActionCardProps {
    callToAction: ScriptCallToAction;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
    isReadOnly?: boolean;
}

export default function ScriptCallToActionCard({ callToAction, scriptUuid, dragHandleProps, isReadOnly }: ScriptCallToActionCardProps) {
    const [content, setContent] = useState(callToAction.content);
    const [callToActionType, setCallToActionType] = useState<CallToActionType>(callToAction.callToActionType);

    const { updateScriptCallToAction } = useUpdateScriptCallToAction();
    const { deleteScriptCallToAction, isPending: isDeleting } = useDeleteScriptCallToAction();

    const handleContentBlur = async () => {
        if (isReadOnly) return;
        if (content.trim() !== callToAction.content) {
            await updateScriptCallToAction({ callToActionUuid: callToAction.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    const handleCallToActionTypeChange = async (newType: CallToActionType) => {
        setCallToActionType(newType);
        if (newType !== callToAction.callToActionType) {
            await updateScriptCallToAction({ callToActionUuid: callToAction.uuid, scriptUuid, data: { callToActionType: newType } });
        }
    };

    return (
        <ScriptPartCard
            partType={ScriptPartType.CallToAction}
            dragHandleProps={dragHandleProps}
            onDelete={isReadOnly ? undefined : () => deleteScriptCallToAction({ callToActionUuid: callToAction.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            {isReadOnly ? (
                <Pill
                    label={callToActionTypeToFrenchTranslation[callToActionType]}
                    isSelected
                    bgColorClassName={callToActionTypeToBgClass[callToActionType]}
                    textColorClassName={callToActionTypeToTextClass[callToActionType]}
                />
            ) : (
                <SelectDropdown
                    items={callToActionTypeOptions}
                    selectedItemId={callToActionType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleCallToActionTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={callToActionTypeToFrenchTranslation[callToActionType]}
                            isSelected
                            bgColorClassName={callToActionTypeToBgClass[callToActionType]}
                            textColorClassName={callToActionTypeToTextClass[callToActionType]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={callToActionTypeToFrenchTranslation[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={callToActionTypeToBgClass[item]}
                            textColorClassName={callToActionTypeToTextClass[item]}
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
                placeholder="Contenu de l'appel à l'action..."
                textStyle="text-sm"
                fullWidth
            />
        </ScriptPartCard>
    );
}
