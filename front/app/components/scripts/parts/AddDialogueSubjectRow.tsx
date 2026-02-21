import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { useCreateDialogueSubject } from "~/hooks/api/dialogueSubjects/useCreateDialogueSubject";

interface Props {
    dialogueUuid: string;
    scriptUuid: string;
}

export default function AddDialogueSubjectRow({ dialogueUuid, scriptUuid }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [speaker, setSpeaker] = useState("");
    const [content, setContent] = useState("");

    const { createDialogueSubject, isPending } = useCreateDialogueSubject();

    const handleAdd = async () => {
        if (!speaker.trim() || !content.trim()) return;
        await createDialogueSubject({ scriptDialogueUuid: dialogueUuid, scriptUuid, speaker: speaker.trim(), content: content.trim() });
        setSpeaker("");
        setContent("");
        setIsOpen(false);
    };

    const handleCancel = () => {
        setSpeaker("");
        setContent("");
        setIsOpen(false);
    };

    if (isOpen) {
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
                    <SimpleTextButton onClick={handleAdd} color="text-primary" hoverColor="hover:text-primary">
                        {isPending ? "Ajout..." : "Ajouter"}
                    </SimpleTextButton>
                    <SimpleTextButton onClick={handleCancel}>Annuler</SimpleTextButton>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="flex flex-row items-center gap-1.5 px-3 py-1 text-gray hover:text-dark transition-colors cursor-pointer"
        >
            <PlusIcon className="size-3.5" strokeWidth={2} />
            <span className="text-body-xs">Ajouter un intervenant</span>
        </button>
    );
}
