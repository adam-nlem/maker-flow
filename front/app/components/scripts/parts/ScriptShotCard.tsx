import { useState } from "react";
import type { ScriptShot } from "~/models/ScriptShot";
import { ShotType, shotTypeToFrenchTranslation, shotTypeToBgClass, shotTypeToTextClass } from "~/models/enums/ShotType";
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
}

export default function ScriptShotCard({ shot, scriptUuid, dragHandleProps }: ScriptShotCardProps) {
    const [content, setContent] = useState(shot.content);
    const [shotType, setShotType] = useState<ShotType>(shot.shotType);

    const { updateScriptShot } = useUpdateScriptShot();
    const { deleteScriptShot, isPending: isDeleting } = useDeleteScriptShot();

    const handleContentBlur = async () => {
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
            onDelete={() => deleteScriptShot({ shotUuid: shot.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
            <SelectDropdown
                items={Object.values(ShotType)}
                selectedItemId={shotType}
                getItemId={(type) => type}
                onSelect={(type) => handleShotTypeChange(type)}
                renderTrigger={({ onClick }) => (
                    <Pill
                        onClick={onClick}
                        label={shotTypeToFrenchTranslation[shotType]}
                        isSelected
                        bgColorClassName={shotTypeToBgClass[shotType]}
                        textColorClassName={shotTypeToTextClass[shotType]}
                    />
                )}
                renderItem={({ item, isSelected, onSelect }) => {
                    return !isSelected ? <Pill
                        label={shotTypeToFrenchTranslation[item]}
                        isSelected
                        onClick={onSelect}
                        bgColorClassName={shotTypeToBgClass[item]}
                        textColorClassName={shotTypeToTextClass[item]}
                    /> : null
                }}
            />
            <TextArea
                simple
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleContentBlur}
                placeholder="Description du plan..."
                textStyle="text-sm"
                fullWidth
            />
        </ScriptPartCard>
    );
}
