import { useState } from "react";
import { Bars3Icon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptShot } from "~/models/ScriptShot";
import { ShotType, shotTypeToLabel, shotTypeToBgClass, shotTypeToTextClass } from "~/models/enums/ShotType";
import { Pill } from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useUpdateScriptShot } from "~/hooks/api/scriptShots/useUpdateScriptShot";
import { useDeleteScriptShot } from "~/hooks/api/scriptShots/useDeleteScriptShot";

interface Props {
    shot: ScriptShot;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptShotCard({ shot, scriptUuid, dragHandleProps }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(shot.content);
    const [shotType, setShotType] = useState<ShotType>(shot.shotType);

    const { updateScriptShot, isPending: isUpdating } = useUpdateScriptShot();
    const { deleteScriptShot, isPending: isDeleting } = useDeleteScriptShot();

    const handleSave = async () => {
        await updateScriptShot({ shotUuid: shot.uuid, scriptUuid, data: { content, shotType } });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setContent(shot.content);
        setShotType(shot.shotType);
        setIsEditing(false);
    };

    const pillColor = `${shotTypeToBgClass[shotType]} ${shotTypeToTextClass[shotType]}`;

    if (isEditing) {
        return (
            <div className="border border-light-gray rounded-xl p-4 bg-clear flex flex-col gap-3">
                <Pill text="Plan" color={pillColor} />
                <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Description du plan..."
                    fullWidth
                />
                <select
                    value={shotType}
                    onChange={(e) => setShotType(e.target.value as ShotType)}
                    className="rounded-xl border border-light-gray px-3 py-1.5 text-sm bg-clear focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    {Object.values(ShotType).map((type) => (
                        <option key={type} value={type}>{shotTypeToLabel[type]}</option>
                    ))}
                </select>
                <div className="flex flex-row gap-3">
                    <SimpleTextButton onClick={handleSave} color="text-primary" hoverColor="hover:text-primary">
                        {isUpdating ? "Enregistrement..." : "Enregistrer"}
                    </SimpleTextButton>
                    <SimpleTextButton onClick={handleCancel}>Annuler</SimpleTextButton>
                </div>
            </div>
        );
    }

    return (
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex flex-row items-start gap-3 hover:border-gray transition-colors">
            <div
                {...dragHandleProps}
                className="shrink-0 mt-0.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            >
                <Bars3Icon className="size-4" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex flex-row items-center gap-2">
                    <Pill text="Plan" color={pillColor} />
                    <Pill text={shotTypeToLabel[shot.shotType]} color={pillColor} />
                </div>
                <p className="text-body-sm text-gray line-clamp-3">{shot.content}</p>
            </div>
            <div className="flex flex-row gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray hover:text-dark transition-colors cursor-pointer"
                >
                    <PencilSquareIcon className="size-4" strokeWidth={2} />
                </button>
                <button
                    onClick={() => deleteScriptShot({ shotUuid: shot.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="text-gray hover:text-danger transition-colors cursor-pointer"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
