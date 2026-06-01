import { useTranslation } from "react-i18next";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useRemoveCollaborator } from "~/hooks/api/collaborators/useRemoveCollaborator";

interface RemoveCollaboratorModalProps {
    isOpen: boolean;
    userUuid: string | null;
    displayLabel: string;
    onClose: () => void;
}

export default function RemoveCollaboratorModal({ isOpen, userUuid, displayLabel, onClose }: RemoveCollaboratorModalProps) {
    const { t } = useTranslation();
    const { removeCollaborator, isPending } = useRemoveCollaborator();

    const handleConfirm = async () => {
        if (!userUuid) return;
        await removeCollaborator(userUuid);
        onClose();
    };

    return (
        <ConfirmDeleteDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            isPending={isPending}
            message={t("collaborators:remove.confirm", { target: displayLabel })}
        />
    );
}
