import { useEffect, useState, type RefObject } from "react";

interface UseIdleAutoHideProps {
    activityRef: RefObject<HTMLElement | null>;
    isActive: boolean;
    delayMs?: number;
}

export function useIdleAutoHide({
    activityRef,
    isActive,
    delayMs = 2500,
}: UseIdleAutoHideProps): boolean {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const element = activityRef.current;
        if (!element) return;

        if (!isActive) {
            setIsHidden(false);
            return;
        }

        let timer: ReturnType<typeof setTimeout> | null = null;

        const scheduleHide = () => {
            if (timer !== null) clearTimeout(timer);
            timer = setTimeout(() => setIsHidden(true), delayMs);
        };

        const handleActivity = () => {
            setIsHidden(false);
            scheduleHide();
        };

        const handleLeave = () => {
            if (timer !== null) clearTimeout(timer);
            setIsHidden(true);
        };

        element.addEventListener('mousemove', handleActivity);
        element.addEventListener('mouseleave', handleLeave);
        scheduleHide();

        return () => {
            if (timer !== null) clearTimeout(timer);
            element.removeEventListener('mousemove', handleActivity);
            element.removeEventListener('mouseleave', handleLeave);
        };
    }, [activityRef, isActive, delayMs]);

    return isHidden;
}
