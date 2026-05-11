import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import InviteClientForm from "./InviteClientForm";

interface InviteClientModalProps {
    showModal: boolean;
    projectUuid: string;
    projectName: string;
    onClose: () => void;
}

export default function InviteClientModal({ showModal, projectUuid, projectName, onClose }: InviteClientModalProps) {
    const { t } = useTranslation();

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} height="max-h-fit">
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                <h1 className="text-heading-lg">{t("clients:invite.modalTitle", { projectName })}</h1>
                <p className="text-body-xs">{t("clients:invite.modalDescription")}</p>
                <InviteClientForm projectUuid={projectUuid} onInvited={onClose} />
            </div>
        </ModalOverlay>
    );
}
