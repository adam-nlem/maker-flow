import { useEffect } from "react";
import { useIsMac } from "~/hooks/useIsMac";

export interface KeyboardShortcut {
    key: string;
    label: string;
}

export function useKeyboardShortcut(
    shortcut: KeyboardShortcut | undefined,
    onTrigger: () => void,
): void {
    const isMac = useIsMac();

    useEffect(() => {
        if (!shortcut) return;

        const handler = (e: KeyboardEvent) => {
            const modifierPressed = isMac ? e.metaKey : e.ctrlKey;
            if (modifierPressed && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
                e.preventDefault();
                onTrigger();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [shortcut, isMac, onTrigger]);
}
