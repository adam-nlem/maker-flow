import { useState } from "react";
import { Bars3Icon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptDialogue } from "~/models/ScriptDialogue";
import { Pill } from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useUpdateScriptDialogue } from "~/hooks/api/scriptDialogues/useUpdateScriptDialogue";
import { useDeleteScriptDialogue } from "~/hooks/api/scriptDialogues/useDeleteScriptDialogue";
import DialogueSubjectRow from "./DialogueSubjectRow";
import AddDialogueSubjectRow from "./AddDialogueSubjectRow";

interface Props {
    dialogue: ScriptDialogue;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptDialogueCard({ dialogue, scriptUuid, dragHandleProps }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(dialogue.title);
    const [description, setDescription] = useState(dialogue.description ?? "");

    const { updateScriptDialogue, isPending: isUpdating } = useUpdateScriptDialogue();
    const { deleteScriptDialogue, isPending: isDeleting } = useDeleteScriptDialogue();

    const handleSave = async () => {
        await updateScriptDialogue({ dialogueUuid: dialogue.uuid, scriptUuid, data: { title, description: description || undefined } });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTitle(dialogue.title);
        setDescription(dialogue.description ?? "");
        setIsEditing(false);
    };

    return (
        <div className="group border border-light-gray rounded-xl bg-clear hover:border-gray transition-colors">
            {/* Card header */}
            <div className="flex flex-row items-start gap-3 p-4">
                <div
                    {...dragHandleProps}
                    className="shrink-0 mt-0.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                >
                    <Bars3Icon className="size-4" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex flex-col gap-3">
                            <Pill text="Dialogue" color="bg-purple/20 text-purple" />
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Titre du dialogue"
                                fullWidth
                            />
                            <TextArea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description (optionnel)"
                                fullWidth
                            />
                            <div className="flex flex-row gap-3">
                                <SimpleTextButton onClick={handleSave} color="text-primary" hoverColor="hover:text-primary">
                                    {isUpdating ? "Enregistrement..." : "Enregistrer"}
                                </SimpleTextButton>
                                <SimpleTextButton onClick={handleCancel}>Annuler</SimpleTextButton>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <Pill text="Dialogue" color="bg-purple/20 text-purple" />
                            <p className="text-heading-sm truncate">{dialogue.title}</p>
                            {dialogue.description && (
                                <p className="text-body-sm text-gray line-clamp-2">{dialogue.description}</p>
                            )}
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <div className="flex flex-row gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray hover:text-dark transition-colors cursor-pointer"
                        >
                            <PencilSquareIcon className="size-4" strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => deleteScriptDialogue({ dialogueUuid: dialogue.uuid, scriptUuid })}
                            disabled={isDeleting}
                            className="text-gray hover:text-danger transition-colors cursor-pointer"
                        >
                            <TrashIcon className="size-4" strokeWidth={2} />
                        </button>
                    </div>
                )}
            </div>

            {/* Subjects section */}
            {dialogue.dialogueSubjects.length > 0 && (
                <div className="border-t border-light-gray px-1 pt-1">
                    {dialogue.dialogueSubjects.map((subject) => (
                        <DialogueSubjectRow
                            key={subject.uuid}
                            subject={subject}
                            scriptUuid={scriptUuid}
                        />
                    ))}
                </div>
            )}

            {/* Add subject row */}
            <div className={`${dialogue.dialogueSubjects.length > 0 ? '' : 'border-t border-light-gray'} px-1 py-1`}>
                <AddDialogueSubjectRow dialogueUuid={dialogue.uuid} scriptUuid={scriptUuid} />
            </div>
        </div>
    );
}
