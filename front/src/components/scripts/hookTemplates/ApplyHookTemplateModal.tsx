import ModalOverlay from "~/components/ui/ModalOverlay";
import { Button } from "~/components/ui/Button";
import type { HookTemplate } from "~/models/HookTemplate";
import { parseHookPlaceholders } from "~/helpers/hookPlaceholderParser";
import Pill from "~/components/ui/Pill";

interface ApplyHookTemplateModalProps {
    isOpen: boolean;
    template: HookTemplate | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ApplyHookTemplateModal({ isOpen, template, onConfirm, onCancel }: ApplyHookTemplateModalProps) {
    if (!template) return null;
    const parts = parseHookPlaceholders(template.content);

    return (
        <ModalOverlay isOpen={isOpen} onClose={onCancel}>
            <div className="flex flex-col gap-4 p-6 flex-1 min-h-0 overflow-y-auto">
                <h3 className="text-heading-lg">Appliquer ce template ?</h3>

                <div className="flex flex-col gap-1">
                    <span className="text-heading-sm">{template.title}</span>
                    <span className="text-body-xs text-gray line-clamp-2 flex flex-wrap items-center gap-1">
                        {parts.map((part, index) =>
                            part.type === 'placeholder' ? (
                                <Pill key={index} label={part.label} isSelected bgColorClassName="bg-purple/10" borderColorClassName="border-primary/30" textColorClassName="text-primary" />
                            ) : (
                                <span key={index}>{part.value}</span>
                            )
                        )}
                    </span>
                </div>

                <p className="text-body-xs text-gray">
                    Le hook actuel sera remplacé par le contenu de ce template.
                </p>

                <Button style="primary" onClick={onConfirm}>
                    Appliquer
                </Button>

                <Button style="secondary" onClick={onCancel}>
                    Annuler
                </Button>

            </div>
        </ModalOverlay>
    );
}
