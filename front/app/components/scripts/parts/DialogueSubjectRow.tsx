import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { DialogueSubject } from "~/models/DialogueSubject";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useUpdateDialogueSubject } from "~/hooks/api/dialogueSubjects/useUpdateDialogueSubject";
import { useDeleteDialogueSubject } from "~/hooks/api/dialogueSubjects/useDeleteDialogueSubject";

interface Props {
    subject: DialogueSubject;
    scriptUuid: string;
}

export default function DialogueSubjectRow({ subject, scriptUuid }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [speaker, setSpeaker] = useState(subject.speaker);
    const [content, setContent] = useState(subject.content);

    const { updateDialogueSubject, isPending: isUpdating } = useUpdateDialogueSubject();
    const { deleteDialogueSubject, isPending: isDeleting } = useDeleteDialogueSubject();

    const handleSave = async () => {
        await updateDialogueSubject({ subjectUuid: subject.uuid, scriptUuid, data: { speaker, content } });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSpeaker(subject.speaker);
        setContent(subject.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteDialogueSubject({ subjectUuid: subject.uuid, scriptUuid });
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2 py-2 px-3 rounded-lg bg-surface-hover">
                <Input
                    simple
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Intervenant"
                    textStyle="text-heading-sm"
                    fullWidth
                />
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Contenu..."
                    fullWidth
                />
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
        <div className="group flex flex-row items-start gap-2 py-1.5 px-3 rounded-lg hover:bg-surface-hover">
            <div className="flex-1 min-w-0">
                <span className="text-heading-sm">{subject.speaker}</span>
                <span className="text-body-sm text-gray ml-2">{subject.content}</span>
            </div>
            <div className="flex flex-row gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray hover:text-dark transition-colors cursor-pointer"
                >
                    <PencilSquareIcon className="size-3.5" strokeWidth={2} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-gray hover:text-danger transition-colors cursor-pointer"
                >
                    <TrashIcon className="size-3.5" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
