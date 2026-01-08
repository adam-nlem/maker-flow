import { createPortal } from "react-dom";
import { useEffect, useCallback } from "react";
import { useSidebarStore } from "~/stores/sidebar/sidebarStore";

interface ModalOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export default function ModalOverlay({ isOpen, onClose, children, className = "" }: ModalOverlayProps) {
    const isSidebarExpanded = useSidebarStore((state) => state.isExpanded);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex flex-row pointer-events-none"
            onClick={onClose}
        >
            {/* Sidebar spacer - adapts to sidebar state */}
            <div className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-72' : 'w-16'}`} />

            {/* Modal content area */}
            <div className={`flex-1 flex bg-black/5 pointer-events-auto p-3 ${className}`}>
                {children}
            </div>
        </div>,
        document.body
    );
}
