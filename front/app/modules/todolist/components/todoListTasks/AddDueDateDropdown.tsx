import { DatePicker } from "~/components/ui/DatePicker";

interface AddDueDateDropdownProps {
    selectedDueDate?: Date;
    onClose: () => void;
    onDueDateSelected: (dueDate: Date) => void;
}

export default function AddDueDateDropdown({ selectedDueDate, onClose, onDueDateSelected }: AddDueDateDropdownProps) {
    return (
        <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-0" onClick={onClose} />
            <div className="absolute top-14 left-0 mt-1 z-10">
                <DatePicker
                    selectedDate={selectedDueDate}
                    onDateSelected={(date) => {
                        onDueDateSelected(date);
                        onClose();
                    }}
                    minDate={new Date()}
                />
            </div>
        </>
    );
}   