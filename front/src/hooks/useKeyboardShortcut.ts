import { useEffect, useRef } from "react";

export interface KeyboardShortcut {
    key: string;
    label: string;
}

// Stack of handlers per normalized key. The last entry wins so that the
// most-recently-mounted consumer (a modal opened on top of a page that already
// uses the same combo) takes precedence and the underlying handler stays
// dormant until the topmost one unmounts.
const handlerStacks: Map<string, Array<() => void>> = new Map();
let listenerInstalled = false;

function isMacPlatform(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function handleGlobalKeyDown(e: KeyboardEvent) {
    const modifierPressed = isMacPlatform() ? e.metaKey : e.ctrlKey;
    if (!modifierPressed) return;

    const stack = handlerStacks.get(e.key.toLowerCase());
    if (!stack || stack.length === 0) return;

    e.preventDefault();
    stack[stack.length - 1]();
}

function registerHandler(key: string, handler: () => void): () => void {
    const normalized = key.toLowerCase();
    const stack = handlerStacks.get(normalized) ?? [];
    stack.push(handler);
    handlerStacks.set(normalized, stack);

    if (!listenerInstalled) {
        window.addEventListener("keydown", handleGlobalKeyDown);
        listenerInstalled = true;
    }

    return () => {
        const current = handlerStacks.get(normalized);
        if (!current) return;
        const idx = current.lastIndexOf(handler);
        if (idx >= 0) current.splice(idx, 1);
        if (current.length === 0) handlerStacks.delete(normalized);
    };
}

export function useKeyboardShortcut(
    shortcut: KeyboardShortcut | undefined,
    onTrigger: () => void,
): void {
    // Always invoke the latest callback without re-registering on every render.
    const triggerRef = useRef(onTrigger);
    triggerRef.current = onTrigger;

    const key = shortcut?.key;

    useEffect(() => {
        if (!key) return;
        return registerHandler(key, () => triggerRef.current());
    }, [key]);
}
