import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

interface DatePickerProps {
    selectedDate?: Date;
    onDateSelected: (date: Date) => void;
    minDate?: Date;
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getDaysInMonth(year: number, month: number): number {
    // Return day 0 of next month, which is the last day of the current month
    return new Date(year, month + 1, 0).getDate(); 
}

function getFirstDayOfMonth(year: number, month: number): number {
    // Returns the weekday of the 1st of the month (0 = Sunday, 6 = Saturday)
    const day = new Date(year, month, 1).getDay();
    // Converts to Monday-based index (0 = Monday, 6 = Sunday)
    return day === 0 ? 6 : day - 1;
}

function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function isPastDay(date: Date, minDate?: Date): boolean {
    const compareDate = minDate ?? new Date();
    compareDate.setHours(0, 0, 0, 0);
    return date < compareDate;
}

export function DatePicker({ selectedDate, onDateSelected, minDate }: DatePickerProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day);
        if (!isPastDay(clickedDate, minDate)) {
            onDateSelected(clickedDate);
        }
    };

    // Build the calendar grid array
    // - null values create empty cells so day 1 aligns with the correct weekday column
    // - Example for March 2024 (starts on Friday): [null, null, null, null, 1, 2, 3, ...]
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className="bg-white border border-light-gray rounded-lg shadow-md p-3 min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-light-gray rounded-md transition-colors"
                >
                    <ChevronLeftIcon className="size-4 text-gray" />
                </button>
                <span className="text-sm font-medium text-dark">
                    {MONTHS_FR[currentMonth]} {currentYear}
                </span>
                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-light-gray rounded-md transition-colors"
                >
                    <ChevronRightIcon className="size-4 text-gray" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_FR.map((day) => (
                    <div key={day} className="text-center text-xs text-gray font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="w-8 h-8" />;
                    }

                    const date = new Date(currentYear, currentMonth, day);
                    const isToday = isSameDay(date, today);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isPast = isPastDay(date, minDate);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            disabled={isPast}
                            className={`
                                w-8 h-8 text-xs rounded-md transition-colors
                                ${isPast ? 'text-light-gray cursor-not-allowed' : 'hover:bg-light-gray cursor-pointer'}
                                ${isToday && !isSelected ? 'text-primary font-semibold' : ''}
                                ${isSelected ? 'bg-primary text-white' : 'text-dark'}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
