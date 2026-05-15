import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import ModalOverlay from "~/components/ui/ModalOverlay"
import { Button } from "~/components/ui/Button"
import PostPicker from "./PostPicker"

interface PostPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (selectedUuids: string[]) => Promise<void> | void
    projectUuid: string
    excludeUuids?: string[]
    isConfirming?: boolean
}

export default function PostPickerModal({ isOpen, onClose, onConfirm, projectUuid, excludeUuids = [], isConfirming = false }: PostPickerModalProps) {
    const { t } = useTranslation()
    const [selectedUuids, setSelectedUuids] = useState<string[]>([])

    useEffect(() => {
        if (!isOpen) setSelectedUuids([])
    }, [isOpen])

    const handleConfirm = async () => {
        if (selectedUuids.length === 0) return
        await onConfirm(selectedUuids)
        setSelectedUuids([])
    }

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-4 p-6 flex-1 min-h-0">
                {/* Header */}
                <h2 className="text-heading-sm shrink-0">{t("contents:picker.modalTitle")}</h2>

                {/* Growable post picker */}
                <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <PostPicker
                        projectUuid={projectUuid}
                        selectedUuids={selectedUuids}
                        onSelectionChange={setSelectedUuids}
                        excludeUuids={excludeUuids}
                    />
                    {selectedUuids.length > 0 && (
                        <p className="text-body-xs text-muted-2 shrink-0">
                            {t("contents:selectedCount", { count: selectedUuids.length })}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-row gap-2 shrink-0">
                    <Button
                        style="secondary"
                        width="w-full"
                        disabled={isConfirming}
                        onClick={onClose}
                    >
                        {t("actions.cancel")}
                    </Button>
                    <Button
                        style="primary"
                        width="w-full"
                        onClick={handleConfirm}
                        isLoading={isConfirming}
                        disabled={selectedUuids.length === 0}
                    >
                        {t("contents:picker.addPosts")}
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    )
}
