import { useState } from "react"
import { useTranslation } from "react-i18next"
import ModalOverlay from "~/components/ui/ModalOverlay"
import { Input } from "~/components/ui/Input"
import { Button } from "~/components/ui/Button"
import { useCreatePostGroup } from "~/hooks/api/postGroups/useCreatePostGroup"
import PostPicker from "./PostPicker"

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    projectUuid: string
}

export default function CreateGroupModal({ isOpen, onClose, projectUuid }: CreateGroupModalProps) {
    const { t } = useTranslation()
    const { createPostGroup, isPending: isCreating } = useCreatePostGroup({ projectUuid })

    const [title, setTitle] = useState("")
    const [selectedPostUuids, setSelectedPostUuids] = useState<string[]>([])

    const handleCreate = async () => {
        if (!title.trim()) return

        await createPostGroup({
            title: title.trim(),
            postUuids: selectedPostUuids,
        })

        setTitle("")
        setSelectedPostUuids([])
        onClose()
    }

    const handleClose = () => {
        setTitle("")
        setSelectedPostUuids([])
        onClose()
    }

    return (
        <ModalOverlay isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col gap-4 p-6 flex-1 min-h-0">
                {/* Header */}
                <div className="flex flex-col gap-4 shrink-0">
                    <h2 className="text-heading-sm">{t("contents:create.modalTitle")}</h2>
                    <Input
                        label={t("contents:create.titleLabel")}
                        placeholder={t("contents:create.titlePlaceholder")}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <h3 className="text-heading-xs text-muted-2">{t("contents:create.postsHeader")}</h3>
                </div>

                {/* Growable post picker */}
                <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <PostPicker
                        projectUuid={projectUuid}
                        selectedUuids={selectedPostUuids}
                        onSelectionChange={setSelectedPostUuids}
                    />
                    {selectedPostUuids.length > 0 && (
                        <p className="text-body-xs text-muted-2 shrink-0">
                            {t("contents:selectedCount", { count: selectedPostUuids.length })}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-row gap-2 shrink-0">
                    <Button
                        style="secondary"
                        width="w-full"
                        onClick={handleClose}
                    >
                        {t("actions.cancel")}
                    </Button>
                    <Button
                        style="primary"
                        width="w-full"
                        onClick={handleCreate}
                        isLoading={isCreating}
                        disabled={!title.trim()}
                    >
                        {t("actions.create")}
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    )
}
