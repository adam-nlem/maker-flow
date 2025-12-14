import ModalOverlay from "~/components/ui/ModalOverlay";

interface DetailTodoListTaskModalProps {
    showModal: boolean;
    onClose: () => void;
}

export default function DetailTodoListTaskModal({ showModal, onClose }: DetailTodoListTaskModalProps) {
    return (
        <ModalOverlay isOpen={showModal} onClose={onClose}>
            <div className="border rounded-xl border-light-gray w-[500px] h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-white" onClick={(e) => e.stopPropagation()}>
                OK
            </div>
        </ModalOverlay>
    );
}