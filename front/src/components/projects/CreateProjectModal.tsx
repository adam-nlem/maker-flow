import { StepBadge } from "~/components/ui/StepBadge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ModalOverlay from "~/components/ui/ModalOverlay";
import CreateProjectForm from "~/components/projects/CreateProjectForm";

interface CreateProjectModalProps {
    showModal: boolean;
    showStepHeader?: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

export default function CreateProjectModal({ showModal, showStepHeader = false, onClose, onProjectCreated }: CreateProjectModalProps) {
    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose} height="max-h-fit" >
            <div className="flex flex-col gap-3 py-5 px-10 flex-1 min-h-0 overflow-y-auto">
                {showStepHeader && (
                    <div className="flex flex-row items-center gap-3">
                        <StepBadge label="Introduction" completed={true} />

                        <ChevronRightIcon className="size-4 text-gray" strokeWidth={2} />

                        <StepBadge label="Projet" completed={false} />
                    </div>
                )}
                <h1 className="text-heading-lg">
                    Créez un nouveau Projet
                </h1>
                <p className="text-body-xs w-90">Les projets vous permettront de regrouper tous les modules afin de vous y retrouver plus rapidement</p>
                <CreateProjectForm onProjectCreated={() => onProjectCreated()} formSpacing="space-y-6" />
            </div>
        </ModalOverlay>
    );
}
