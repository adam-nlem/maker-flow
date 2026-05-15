import { StepBadge } from "~/components/ui/StepBadge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import CreateProjectForm from "~/components/projects/CreateProjectForm";

interface CreateProjectModalProps {
    showModal: boolean;
    showStepHeader?: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

export default function CreateProjectModal({ showModal, showStepHeader = false, onClose, onProjectCreated }: CreateProjectModalProps) {
    const { t } = useTranslation();

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} height="max-h-fit" >
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                {showStepHeader && (
                    <div className="flex flex-row items-center gap-3">
                        <StepBadge label={t("projects:create.introductionStep")} completed={true} />

                        <ChevronRightIcon className="size-4 text-muted-2" strokeWidth={2} />

                        <StepBadge label={t("projects:create.projectStep")} completed={false} />
                    </div>
                )}
                <h1 className="text-heading-lg">
                    {t("projects:create.modalTitle")}
                </h1>
                <p className="text-body-xs w-90">{t("projects:create.modalDescription")}</p>
                <CreateProjectForm onProjectCreated={() => onProjectCreated()} formSpacing="space-y-6" />
            </div>
        </ModalOverlay>
    );
}
