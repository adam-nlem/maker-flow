import { useState } from "react";
import type { ScriptDialogue } from "~/models/ScriptDialogue";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScriptDialogue } from "~/hooks/api/scriptDialogues/useUpdateScriptDialogue";
import { useDeleteScriptDialogue } from "~/hooks/api/scriptDialogues/useDeleteScriptDialogue";
import ScriptPartCard from "./ScriptPartCard";
import DialogueSubjectRow from "./DialogueSubjectRow";
import AddDialogueSubjectRow from "./AddDialogueSubjectRow";

interface ScriptDialogueCardProps {
    dialogue: ScriptDialogue;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptDialogueCard({ dialogue, scriptUuid, dragHandleProps }: ScriptDialogueCardProps) {
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
        <ScriptPartCard
            partType={ScriptPartType.Dialogue}
            dragHandleProps={dragHandleProps}
            onDelete={() => deleteScriptDialogue({ dialogueUuid: dialogue.uuid, scriptUuid })}
            isDeleting={isDeleting}
        >
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
                textStyle="text-sm"
                fullWidth
            />

            {/* Subjects section */}
            {dialogue.dialogueSubjects.length > 0 && (
                <div className="-mx-4 border-t border-light-gray px-1 pt-1">
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
            <div className={`-mx-4 ${dialogue.dialogueSubjects.length > 0 ? '' : 'border-t border-light-gray'} px-1 py-1 ${dialogue.dialogueSubjects.length === 0 ? '' : ''}`}>
                <AddDialogueSubjectRow dialogueUuid={dialogue.uuid} scriptUuid={scriptUuid} />
            </div>
        </ScriptPartCard>
    );
}
