import { PlusCircleIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/Button";
import ModalOverlay from "~/components/ui/ModalOverlay";

interface SelectItemModalProps<T> {
    showModal: boolean;
    items: T[];
    selectedItemId?: string | null;
    getItemId: (item: T) => string;
    onSelect: (item: T) => void;
    onClose: () => void;
    onClickCreateButton: () => void;
    createButtonLabel: string;
    renderItem: (args: { item: T; isSelected: boolean; onSelect: () => void; }) => ReactNode;
}

export default function SelectItemModal<T>({
    showModal,
    items,
    selectedItemId,
    getItemId,
    onSelect,
    onClose,
    onClickCreateButton,
    createButtonLabel,
    renderItem,
}: SelectItemModalProps<T>) {
    if (!showModal) return null;

    const handleSelect = (item: T) => {
        onSelect(item);
        onClose();
    };

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose}>
            <div className="self-start border rounded-xl border-light-gray w-fit max-h-full flex flex-col gap-3 p-3 shadow-lg bg-white overflow-y-auto scrollbar-none scroll-pb-5" onClick={(e) => e.stopPropagation()}>
                {items.map((item) => {
                    const itemId = getItemId(item);
                    const isSelected = selectedItemId ? selectedItemId === itemId : false;

                    return (
                        <div key={itemId}>
                            {renderItem({
                                item,
                                isSelected,
                                onSelect: () => handleSelect(item),
                            })}
                        </div>
                    ); 
                })}

                <Button
                    type="button"
                    fullWidth
                    size="lg"
                    variant="secondary"
                    onClick={onClickCreateButton}
                    className="shrink-0" // Prevents the button from being compressed
                >
                    <div className="flex flex-row justify-center items-center gap-3">
                        <p className="text-sm">{createButtonLabel}</p>
                        <PlusCircleIcon className="size-4 text-clear" strokeWidth={2} />
                    </div>
                </Button>
            </div>
        </ModalOverlay>
    );
}
