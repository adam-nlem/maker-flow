import { useState } from "react"
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
                    <h2 className="text-heading-sm">Nouveau groupe</h2>
                    <Input
                        label="Titre"
                        placeholder="Nom du groupe..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <h3 className="text-heading-xs text-gray">Posts (optionnel)</h3>
                </div>

                {/* Growable post picker */}
                <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <PostPicker
                        projectUuid={projectUuid}
                        selectedUuids={selectedPostUuids}
                        onSelectionChange={setSelectedPostUuids}
                    />
                    {selectedPostUuids.length > 0 && (
                        <p className="text-body-xs text-gray shrink-0">
                            {selectedPostUuids.length} post{selectedPostUuids.length > 1 ? "s" : ""} sélectionné{selectedPostUuids.length > 1 ? "s" : ""}
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
                        Annuler
                    </Button>
                    <Button
                        style="primary"
                        width="w-full"
                        onClick={handleCreate}
                        isLoading={isCreating}
                        disabled={!title.trim()}
                    >
                        Créer
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    )
}
