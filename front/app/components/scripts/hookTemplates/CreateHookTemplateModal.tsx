import { useState, useRef } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import { ToggleChip } from "~/components/ui/ToggleChip";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { useCreateHookTemplate } from "~/hooks/api/hookTemplates/useCreateHookTemplate";
import { HookTemplatePlaceholder, hookTemplatePlaceholderOptions, hookTemplatePlaceholderToFrenchTranslation } from "~/models/enums/HookTemplatePlaceholder";
import { insertPlaceholder, formatPlaceholderToken } from "~/helpers/hookPlaceholderParser";

interface CreateHookTemplateModalProps {
    showModal: boolean;
    onClose: () => void;
}

export default function CreateHookTemplateModal({ showModal, onClose }: CreateHookTemplateModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const { createHookTemplate, isPending } = useCreateHookTemplate();

    const resetForm = () => {
        setTitle("");
        setContent("");
        setIsPublic(false);
    };

    const handleInsertPlaceholder = (placeholder: HookTemplatePlaceholder) => {
        const textarea = textAreaRef.current;
        const start = textarea?.selectionStart ?? content.length;
        const end = textarea?.selectionEnd ?? content.length;
        const result = insertPlaceholder(content, placeholder, start, end);
        setContent(result.content);

        if (textarea) {
            requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
            });
        }
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        await createHookTemplate({ title, content, isPublic });
        resetForm();
        onClose();
    };

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} className="justify-center items-center">
            <div className="border rounded-xl border-light-gray w-125 h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-clear" onClick={(e) => e.stopPropagation()}>
                <h1 className="text-heading-lg">
                    Nouveau template de hook
                </h1>
                <p className="text-body-xs">Créez un template réutilisable pour vos hooks. Ajoutez des placeholders pour personnaliser le contenu à chaque utilisation.</p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Titre"
                        placeholder="Nom du template"
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div>
                        <TextArea
                            ref={textAreaRef}
                            label="Contenu"
                            placeholder="Écrivez le contenu du hook..."
                            id="content"
                            name="content"
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        <div className="mt-3">
                            <p className="text-heading-sm">Placeholders</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {hookTemplatePlaceholderOptions.map((placeholder) => {
                                    const isUsed = content.includes(formatPlaceholderToken(placeholder));
                                    return (
                                        <button
                                            key={placeholder}
                                            type="button"
                                            onClick={() => handleInsertPlaceholder(placeholder)}
                                            className={isUsed ? "opacity-40 pointer-events-none" : "cursor-pointer"}
                                        >
                                            <Pill
                                                label={hookTemplatePlaceholderToFrenchTranslation[placeholder]}
                                                isSelected
                                                bgColorClassName="bg-purple/10 hover:bg-purple/20" borderColorClassName="border-primary/30"
                                                textColorClassName="text-primary"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="mt-5"
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">Créer le template</p>
                            <ChevronRightIcon className="size-4" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
            </div>
        </ModalOverlay>
    );
}
