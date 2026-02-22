import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { DialogueSubject } from "~/models/DialogueSubject";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateDialogueSubject } from "~/hooks/api/dialogueSubjects/useUpdateDialogueSubject";
import { useDeleteDialogueSubject } from "~/hooks/api/dialogueSubjects/useDeleteDialogueSubject";

interface DialogueSubjectRowProps {
    subject: DialogueSubject;
    scriptUuid: string;
}

export default function DialogueSubjectRow({ subject, scriptUuid }: DialogueSubjectRowProps) {
    const [speaker, setSpeaker] = useState(subject.speaker);
    const [content, setContent] = useState(subject.content);

    const { updateDialogueSubject } = useUpdateDialogueSubject();
    const { deleteDialogueSubject, isPending: isDeleting } = useDeleteDialogueSubject();

    const handleSpeakerBlur = async () => {
        if (speaker.trim() !== subject.speaker) {
            await updateDialogueSubject({ subjectUuid: subject.uuid, scriptUuid, data: { speaker: speaker.trim() } });
        }
    };

    const handleContentBlur = async () => {
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
                    placeholder="Intervenant"
                    textStyle="text-heading-sm"
                    fullWidth
                />
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleContentBlur}
                    placeholder="Contenu..."
                    textStyle="text-sm"
                    fullWidth
                />
            </div>
            <button
                onClick={() => deleteDialogueSubject({ subjectUuid: subject.uuid, scriptUuid })}
                disabled={isDeleting}
                className="shrink-0 mt-1 text-gray hover:text-danger cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
                <TrashIcon className="size-3.5" strokeWidth={2} />
            </button>
        </div>
    );
}
