import { UserCircleIcon } from "@heroicons/react/24/outline";
import ModalOverlay from "~/components/ui/ModalOverlay";
import CreatorProfileForm from "./CreatorProfileForm";
import type { CreatorProfile } from "~/models/CreatorProfile";

interface CreatorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectUuid: string;
    creatorProfile: CreatorProfile | null;
}

export default function CreatorProfileModal({ isOpen, onClose, projectUuid, creatorProfile }: CreatorProfileModalProps) {
    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div
                className="border rounded-xl border-light-gray w-137.5 h-fit max-h-[90vh] flex flex-col shadow-lg bg-clear overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 py-5 border-b border-light-gray flex flex-row items-center gap-3">
                    <UserCircleIcon className="size-5 text-primary" strokeWidth={2} />
                    <h1 className="text-heading-lg">Profil créateur</h1>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-5 scrollbar-none">
                    <p className="text-body-xs mb-5">
                        Configurez votre profil pour que l'IA génère du contenu adapté à votre style et votre audience.
                    </p>

                    <CreatorProfileForm
                        projectUuid={projectUuid}
                        creatorProfile={creatorProfile}
                        onSuccess={onClose}
                    />
                </div>
            </div>
        </ModalOverlay>
    );
}
