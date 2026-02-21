import { useState } from "react";
import { Bars3Icon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptVoiceOver } from "~/models/ScriptVoiceOver";
import { VoiceOverType, voiceOverTypeToLabel, voiceOverTypeToBgClass, voiceOverTypeToTextClass } from "~/models/enums/VoiceOverType";
import { Pill } from "~/components/ui/Pill";
import { TextArea } from "~/components/ui/TextArea";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useUpdateScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useUpdateScriptVoiceOver";
import { useDeleteScriptVoiceOver } from "~/hooks/api/scriptVoiceOvers/useDeleteScriptVoiceOver";

interface Props {
    voiceOver: ScriptVoiceOver;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptVoiceOverCard({ voiceOver, scriptUuid, dragHandleProps }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(voiceOver.content);
    const [voiceOverType, setVoiceOverType] = useState<VoiceOverType>(voiceOver.voiceOverType);

    const { updateScriptVoiceOver, isPending: isUpdating } = useUpdateScriptVoiceOver();
    const { deleteScriptVoiceOver, isPending: isDeleting } = useDeleteScriptVoiceOver();

    const handleSave = async () => {
        await updateScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid, data: { content, voiceOverType } });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setContent(voiceOver.content);
        setVoiceOverType(voiceOver.voiceOverType);
        setIsEditing(false);
    };

    const pillColor = `${voiceOverTypeToBgClass[voiceOverType]} ${voiceOverTypeToTextClass[voiceOverType]}`;

    if (isEditing) {
        return (
            <div className="border border-light-gray rounded-xl p-4 bg-clear flex flex-col gap-3">
                <Pill text="Voix off" color={pillColor} />
                <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Contenu de la voix off..."
                    fullWidth
                />
                <select
                    value={voiceOverType}
                    onChange={(e) => setVoiceOverType(e.target.value as VoiceOverType)}
                    className="rounded-xl border border-light-gray px-3 py-1.5 text-sm bg-clear focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    {Object.values(VoiceOverType).map((type) => (
                        <option key={type} value={type}>{voiceOverTypeToLabel[type]}</option>
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
                    <Pill text="Voix off" color={pillColor} />
                    <Pill text={voiceOverTypeToLabel[voiceOver.voiceOverType]} color={pillColor} />
                </div>
                <p className="text-body-sm text-gray line-clamp-3">{voiceOver.content}</p>
            </div>
            <div className="flex flex-row gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray hover:text-dark transition-colors cursor-pointer"
                >
                    <PencilSquareIcon className="size-4" strokeWidth={2} />
                </button>
                <button
                    onClick={() => deleteScriptVoiceOver({ voiceOverUuid: voiceOver.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="text-gray hover:text-danger transition-colors cursor-pointer"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
