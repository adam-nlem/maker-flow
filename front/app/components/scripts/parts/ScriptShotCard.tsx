import { useState } from "react";
import { FilmIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptShot } from "~/models/ScriptShot";
import { ShotType, shotTypeToLabel, shotTypeToBgClass, shotTypeToTextClass } from "~/models/enums/ShotType";
import { Pill } from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useUpdateScriptShot } from "~/hooks/api/scriptShots/useUpdateScriptShot";
import { useDeleteScriptShot } from "~/hooks/api/scriptShots/useDeleteScriptShot";
import ScriptPartHeader from "./ScriptPartHeader";

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

    const pillColor = `${shotTypeToBgClass[shotType]} ${shotTypeToTextClass[shotType]}`;

    return (
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex-1 flex flex-col gap-2">
            <ScriptPartHeader icon={FilmIcon} label="Plan" colorClassName="bg-primary/10 border border-primary/30" dragHandleProps={dragHandleProps} />
            <div className="flex flex-row items-center gap-2">
                <SelectDropdown
                    items={Object.values(ShotType)}
                    selectedItemId={shotType}
                    getItemId={(type) => type}
                    onSelect={(type) => handleShotTypeChange(type)}
                    renderTrigger={({ onClick }) => (
                        <button onClick={onClick} className="cursor-pointer">
                            <Pill text={shotTypeToLabel[shotType]} color={pillColor} />
                        </button>
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <button onClick={onSelect} className="cursor-pointer">
                            <Pill
                                text={shotTypeToLabel[item]}
                                color={`${shotTypeToBgClass[item]} ${shotTypeToTextClass[item]}${isSelected ? " ring-1 ring-current" : ""}`}
                            />
                        </button>
                    )}
                />
                <button
                    onClick={() => deleteScriptShot({ shotUuid: shot.uuid, scriptUuid })}
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
                placeholder="Description du plan..."
                textStyle="text-sm"
                fullWidth
            />
        </div>
    );
}
