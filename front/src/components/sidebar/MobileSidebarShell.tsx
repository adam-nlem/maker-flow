import { createPortal } from "react-dom";
import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useMobileSidebarStore } from "~/stores/sidebar/mobileSidebarStore";

interface MobileSidebarShellProps {
    desktop: ReactNode;
}

export default function MobileSidebarShell({ desktop }: MobileSidebarShellProps) {
    const isOpen = useMobileSidebarStore((state) => state.isOpen);
    const setIsOpen = useMobileSidebarStore((state) => state.setIsOpen);
    const location = useLocation();
    const previousPathname = useRef(location.pathname);

    // Auto-close on route change
    useEffect(() => {
        if (previousPathname.current !== location.pathname) {
            setIsOpen(false);
            previousPathname.current = location.pathname;
        }
    }, [location.pathname, setIsOpen]);

    // ESC key handler + body scroll lock
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
    }, [setIsOpen]);

    useEffect(() => {
        if (!isOpen) return;

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative h-screen w-14 bg-clear shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {desktop}
            </div>
        </div>,
        document.body
    );
}
