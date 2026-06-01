import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { ModalAlign } from "~/models/enums/ModalAlign";
import { Button } from "~/components/ui/Button";
import type { Script } from "~/models/Script";
import ScriptPicker from "./ScriptPicker";

interface ScriptPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (script: Script) => void;
    projectUuid: string;
    initialSelectedUuid?: string | null;
    align?: ModalAlign;
    nested?: boolean;
}

export default function ScriptPickerModal({
    isOpen,
    onClose,
    onConfirm,
    projectUuid,
    initialSelectedUuid = null,
    align = ModalAlign.Center,
    nested = false,
}: ScriptPickerModalProps) {
    const { t } = useTranslation();
    const [pending, setPending] = useState<Script | null>(null);

    useEffect(() => {
        if (!isOpen) setPending(null);
    }, [isOpen]);

    const selectedUuid = pending?.uuid ?? initialSelectedUuid;

    const handleConfirm = () => {
        if (!pending) return;
        onConfirm(pending);
        onClose();
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onClose={onClose}
            align={align}
            nested={nested}
            width="w-160"
            height="h-160"
        >
            <div className="flex flex-col gap-4 p-6 flex-1 min-h-full">
                <h2 className="text-heading-sm shrink-0">{t("scripts:picker.modalTitle")}</h2>

                <ScriptPicker
                    projectUuid={projectUuid}
                    selectedUuid={selectedUuid}
                    onSelect={setPending}
                />

                <div className="flex flex-row gap-2 shrink-0">
                    <Button style="secondary" width="w-full" onClick={onClose}>
                        {t("actions.cancel")}
                    </Button>
                    <Button
                        style="primary"
                        width="w-full"
                        onClick={handleConfirm}
                        disabled={!pending}
                    >
                        {t("scripts:picker.confirm")}
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
}
