import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { Button } from "~/components/ui/Button";
import type { HookTemplate } from "~/models/HookTemplate";
import { parseHookPlaceholders } from "~/utils/hookPlaceholderParser";
import Pill from "~/components/ui/Pill";

interface ApplyHookTemplateModalProps {
    isOpen: boolean;
    template: HookTemplate | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ApplyHookTemplateModal({ isOpen, template, onConfirm, onCancel }: ApplyHookTemplateModalProps) {
    const { t } = useTranslation();

    if (!template) return null;
    const parts = parseHookPlaceholders(template.content);

    return (
        <ModalOverlay isOpen={isOpen} onClose={onCancel}>
            <div className="flex flex-col gap-4 p-6 flex-1 min-h-0 overflow-y-auto">
                <h3 className="text-heading-lg">{t("scripts:hooks.applyTitle")}</h3>

                <div className="flex flex-col gap-1">
                    <span className="text-heading-sm">{template.title}</span>
                    <span className="text-body-xs text-muted-2 line-clamp-2 flex flex-wrap items-center gap-1">
                        {parts.map((part, index) =>
                            part.type === 'placeholder' ? (
                                <Pill key={index} label={part.label} isSelected bgColorClassName="bg-purple/10" borderColorClassName="border-primary/30" textColorClassName="text-primary" />
                            ) : (
                                <span key={index}>{part.value}</span>
                            )
                        )}
                    </span>
                </div>

                <p className="text-body-xs text-muted-2">
                    {t("scripts:hooks.applyHint")}
                </p>

                <Button style="primary" onClick={onConfirm}>
                    {t("scripts:hooks.apply")}
                </Button>

                <Button style="secondary" onClick={onCancel}>
                    {t("actions.cancel")}
                </Button>

            </div>
        </ModalOverlay>
    );
}
