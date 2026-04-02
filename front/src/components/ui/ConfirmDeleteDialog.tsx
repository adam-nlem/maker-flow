import ModalOverlay from "~/components/ui/ModalOverlay";
import { Button } from "~/components/ui/Button";

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    isPending?: boolean;
    message: string;
}

export default function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, isPending = false, message }: ConfirmDeleteDialogProps) {
    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} width="w-120" height="h-fit">
            <div className="flex flex-col items-center gap-4 py-6 px-8 flex-1 min-h-0 overflow-y-auto">
                <p className="text-body-xs text-center">{message}</p>
                <div className="flex flex-row w-full justify-center items-center gap-3">
                    <Button
                        width="w-1/3"
                        disabled={isPending}
                        onClick={onClose}
                    >
                        Annuler
                    </Button>
                    <Button
                        width="w-1/3"
                        style="danger"
                        isLoading={isPending}
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        Continuer
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
}
