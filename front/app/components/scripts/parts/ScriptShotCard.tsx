import { useState } from "react";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptShot } from "~/models/ScriptShot";
import { ShotType, shotTypeToLabel, shotTypeToBgClass, shotTypeToTextClass } from "~/models/enums/ShotType";
import { Pill } from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScriptShot } from "~/hooks/api/scriptShots/useUpdateScriptShot";
import { useDeleteScriptShot } from "~/hooks/api/scriptShots/useDeleteScriptShot";

interface Props {
    shot: ScriptShot;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptShotCard({ shot, scriptUuid, dragHandleProps }: Props) {
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
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex flex-row items-start gap-3">
            <div
                {...dragHandleProps}
                className="shrink-0 mt-0.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            >
                <Bars3Icon className="size-4" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <Pill text="Plan" color={pillColor} />
                    <select
                        value={shotType}
                        onChange={(e) => handleShotTypeChange(e.target.value as ShotType)}
                        className="text-xs px-2 py-0.5 rounded-lg border-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                    >
                        {Object.values(ShotType).map((type) => (
                            <option key={type} value={type}>{shotTypeToLabel[type]}</option>
                        ))}
                    </select>
                </div>
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleContentBlur}
                    placeholder="Description du plan..."
                    textStyle="text-body-sm"
                    fullWidth
                />
            </div>
            <button
                onClick={() => deleteScriptShot({ shotUuid: shot.uuid, scriptUuid })}
                disabled={isDeleting}
                className="shrink-0 mt-0.5 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
                <TrashIcon className="size-4" strokeWidth={2} />
            </button>
        </div>
    );
}
