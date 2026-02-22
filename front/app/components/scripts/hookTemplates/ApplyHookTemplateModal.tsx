import ModalOverlay from "~/components/ui/ModalOverlay";
import { Button } from "~/components/ui/Button";
import type { HookTemplate } from "~/models/HookTemplate";

interface ApplyHookTemplateModalProps {
    isOpen: boolean;
    template: HookTemplate | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ApplyHookTemplateModal({ isOpen, template, onConfirm, onCancel }: ApplyHookTemplateModalProps) {
    if (!template) return null;

    return (
        <ModalOverlay isOpen={isOpen} onClose={onCancel} className="items-center justify-center">
            <div
                className="bg-clear rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col gap-4 border border-light-gray"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-heading-lg">Appliquer ce template ?</h3>

                <div className="flex flex-col gap-1">
                    <span className="text-heading-sm">{template.title}</span>
                    <p className="text-body-sm text-gray">{template.content}</p>
                </div>

                <p className="text-body-xs text-gray">
                    Le hook actuel sera remplacé par le contenu de ce template.
                </p>

                <div className="flex flex-row gap-3 justify-end">
                    <Button style="secondary" width="w-fit" onClick={onCancel}>
                        Annuler
                    </Button>
                    <Button style="primary" width="w-fit" onClick={onConfirm}>
                        Appliquer
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
}
