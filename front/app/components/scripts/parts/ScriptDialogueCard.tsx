import { useState } from "react";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptDialogue } from "~/models/ScriptDialogue";
import { Pill } from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
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
    const [title, setTitle] = useState(dialogue.title);
    const [description, setDescription] = useState(dialogue.description ?? "");

    const { updateScriptDialogue } = useUpdateScriptDialogue();
    const { deleteScriptDialogue, isPending: isDeleting } = useDeleteScriptDialogue();

    const handleTitleBlur = async () => {
        if (title.trim() !== dialogue.title) {
            await updateScriptDialogue({ dialogueUuid: dialogue.uuid, scriptUuid, data: { title: title.trim() } });
        }
    };

    const handleDescriptionBlur = async () => {
        if (description.trim() !== (dialogue.description ?? "")) {
            await updateScriptDialogue({ dialogueUuid: dialogue.uuid, scriptUuid, data: { description: description.trim() || undefined } });
        }
    };

    return (
        <div className="group border border-light-gray rounded-xl bg-clear">
            {/* Card header */}
            <div className="flex flex-row items-start gap-3 p-4">
                <div
                    {...dragHandleProps}
                    className="shrink-0 mt-0.5 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                >
                    <Bars3Icon className="size-4" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Pill text="Dialogue" color="bg-purple/20 text-purple" />
                    <Input
                        simple
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        placeholder="Titre du dialogue"
                        textStyle="text-heading-sm"
                        fullWidth
                    />
                    <TextArea
                        simple
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        placeholder="Description (optionnel)"
                        textStyle="text-body-sm"
                        fullWidth
                    />
                </div>
                <button
                    onClick={() => deleteScriptDialogue({ dialogueUuid: dialogue.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="shrink-0 mt-0.5 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
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
