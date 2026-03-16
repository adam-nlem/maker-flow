import { useState } from "react";
import type { ScriptShot } from "~/models/ScriptShot";
import { type ShotType, shotTypeOptions, shotTypeToFrenchTranslation, shotTypeToBgClass, shotTypeToBorderClass, shotTypeToTextClass } from "~/models/enums/ShotType";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import Pill from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptShot } from "~/hooks/api/scriptShots/useUpdateScriptShot";
import { useDeleteScriptShot } from "~/hooks/api/scriptShots/useDeleteScriptShot";
import ScriptPartCard from "./ScriptPartCard";

interface ScriptShotCardProps {
    shot: ScriptShot;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
    isReadOnly?: boolean;
}

export default function ScriptShotCard({ shot, scriptUuid, dragHandleProps, isReadOnly }: ScriptShotCardProps) {
    const [content, setContent] = useState(shot.content);
    const [shotType, setShotType] = useState<ShotType>(shot.shotType);

    const { updateScriptShot } = useUpdateScriptShot();
    const { deleteScriptShot, isPending: isDeleting } = useDeleteScriptShot();

    const handleContentBlur = async () => {
        if (isReadOnly) return;
        if (content.trim() !== shot.content) {
            await updateScriptShot({ shotUuid: shot.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    const handleShotTypeChange = async (newType: ShotType) => {
        setShotType(newType);
        if (newType !== shot.shotType) {
            await updateScriptShot({ shotUuid: shot.uuid, scriptUuid, data: { shotType: newType } });
        }
    };

    return (
        <ScriptPartCard
            partType={ScriptPartType.Shot}
            dragHandleProps={dragHandleProps}
            onDelete={isReadOnly ? undefined : () => deleteScriptShot({ shotUuid: shot.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            {isReadOnly ? (
                <Pill
                    label={shotTypeToFrenchTranslation[shotType]}
                    isSelected
                    bgColorClassName={shotTypeToBgClass[shotType]}
                    borderColorClassName={shotTypeToBorderClass[shotType]}
                    textColorClassName={shotTypeToTextClass[shotType]}
                />
            ) : (
                <SelectDropdown
                    items={shotTypeOptions}
                    selectedItemId={shotType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleShotTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            onClick={onClick}
                            label={shotTypeToFrenchTranslation[shotType]}
                            isSelected
                            bgColorClassName={shotTypeToBgClass[shotType]}
                            borderColorClassName={shotTypeToBorderClass[shotType]}
                            textColorClassName={shotTypeToTextClass[shotType]}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => {
                        return !isSelected ? <Pill
                            label={shotTypeToFrenchTranslation[item]}
                            isSelected
                            onClick={onSelect}
                            bgColorClassName={shotTypeToBgClass[item]}
                            borderColorClassName={shotTypeToBorderClass[item]}
                            textColorClassName={shotTypeToTextClass[item]}
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
                placeholder="Description du plan..."
                textStyle="text-sm"
            />
        </ScriptPartCard>
    );
}
