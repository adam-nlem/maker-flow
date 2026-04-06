import { useFloating, offset, flip, shift, autoUpdate, useDismiss, useInteractions, FloatingPortal } from "@floating-ui/react"
import { DatePicker } from "~/components/ui/DatePicker";

interface AddDueDateDropdownProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    selectedDueDate?: Date;
    onClose: () => void;
    onDueDateSelected: (dueDate: Date) => void;
}

export default function AddDueDateDropdown({ anchorRef, selectedDueDate, onClose, onDueDateSelected }: AddDueDateDropdownProps) {
    const { refs, floatingStyles, context } = useFloating({
        open: true,
        onOpenChange: (open) => { if (!open) onClose() },
        placement: "bottom-start",
        elements: { reference: anchorRef.current },
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })

    const dismiss = useDismiss(context)
    const { getFloatingProps } = useInteractions([dismiss])

    return (
        <FloatingPortal>
            <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-70"
            >
                <DatePicker
                    selectedDate={selectedDueDate}
                    onDateSelected={(date) => {
                        onDueDateSelected(date);
                        onClose();
                    }}
                    minDate={new Date()}
                />
            </div>
        </FloatingPortal>
    );
}
