import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import InviteCollaboratorForm from "./InviteCollaboratorForm";

interface InviteCollaboratorModalProps {
    showModal: boolean;
    onClose: () => void;
}

export default function InviteCollaboratorModal({ showModal, onClose }: InviteCollaboratorModalProps) {
    const { t } = useTranslation();

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} height="max-h-fit">
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                <h1 className="text-heading-lg">{t("collaborators:invite.modalTitle")}</h1>
                <p className="text-body-xs">{t("collaborators:invite.modalDescription")}</p>
                <InviteCollaboratorForm onInvited={onClose} />
            </div>
        </ModalOverlay>
    );
}
