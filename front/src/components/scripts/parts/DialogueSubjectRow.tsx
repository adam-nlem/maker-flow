import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { DialogueSubject } from "~/models/DialogueSubject";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateDialogueSubject } from "~/hooks/api/dialogueSubjects/useUpdateDialogueSubject";
import { useDeleteDialogueSubject } from "~/hooks/api/dialogueSubjects/useDeleteDialogueSubject";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";

interface DialogueSubjectRowProps {
    subject: DialogueSubject;
    scriptUuid: string;
    isReadOnly?: boolean;
}

export default function DialogueSubjectRow({ subject, scriptUuid, isReadOnly }: DialogueSubjectRowProps) {
    const [speaker, setSpeaker] = useState(subject.speaker);
    const [content, setContent] = useState(subject.content);
    const [showConfirm, setShowConfirm] = useState(false);

    const { updateDialogueSubject } = useUpdateDialogueSubject();
    const { deleteDialogueSubject, isPending: isDeleting } = useDeleteDialogueSubject();

    const handleSpeakerBlur = async () => {
        if (isReadOnly) return;
        if (speaker.trim() !== subject.speaker) {
            await updateDialogueSubject({ subjectUuid: subject.uuid, scriptUuid, data: { speaker: speaker.trim() } });
        }
    };

    const handleContentBlur = async () => {
        if (isReadOnly) return;
        if (content.trim() !== subject.content) {
            await updateDialogueSubject({ subjectUuid: subject.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    return (
        <div className="group flex flex-row items-start gap-2 py-1.5 px-3 rounded-lg">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <Input
                    simple
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    onBlur={handleSpeakerBlur}
                    readOnly={isReadOnly}
                    placeholder="Intervenant"
                    textStyle="text-heading-sm"
                />
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleContentBlur}
                    readOnly={isReadOnly}
                    placeholder="Contenu..."
                    textStyle="text-sm"
                />
            </div>
            {!isReadOnly && (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isDeleting}
                    className="shrink-0 mt-1 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
                >
                    <TrashIcon className="size-3.5" strokeWidth={2} />
                </button>
            )}

            <ConfirmDeleteDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => deleteDialogueSubject({ subjectUuid: subject.uuid, scriptUuid })}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer cet intervenant ? Cette action est irréversible."
            />
        </div>
    );
}
