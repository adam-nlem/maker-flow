import { useTranslation } from "react-i18next";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useDeleteInvitation } from "~/hooks/api/invitations/useDeleteInvitation";

interface DeleteInvitationModalProps {
    isOpen: boolean;
    invitationUuid: string | null;
    displayLabel: string;
    onClose: () => void;
}

export default function DeleteInvitationModal({ isOpen, invitationUuid, displayLabel, onClose }: DeleteInvitationModalProps) {
    const { t } = useTranslation();
    const { deleteInvitation, isPending } = useDeleteInvitation();

    const handleConfirm = async () => {
        if (!invitationUuid) return;
        await deleteInvitation(invitationUuid);
        onClose();
    };

    return (
        <ConfirmDeleteDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            isPending={isPending}
            message={t("invitations:delete.confirm", { target: displayLabel })}
        />
    );
}
