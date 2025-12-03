import { CheckBadgeIcon, CheckIcon } from "@heroicons/react/24/outline";
import { CircularProgress } from "./CircularProgress";

interface StepBadgeProps {
    label: string;
    completed: boolean;
}

export function StepBadge({ label, completed }: StepBadgeProps) {
    return (
        <div className="flex flex-row items-center gap-1">
            {completed ? (
                <div className="rounded-full bg-primary h-min p-0.5">
                    <CheckIcon className="size-4 text-clear" strokeWidth={2} />
                </div>
            ) : (
                <CircularProgress size={20} />
            )}
            <p className="text-heading-xs">{label}</p>
        </div>
    );
}
