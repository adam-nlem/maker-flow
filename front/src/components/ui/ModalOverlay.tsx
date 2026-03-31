import { createPortal } from "react-dom";
import { useEffect, useCallback } from "react";

interface ModalOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export default function ModalOverlay({ isOpen, onClose, children, className = "" }: ModalOverlayProps) {
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
            {/* Sidebar spacer */}
            <div className="shrink-0 w-72" />

            {/* Modal content area */}
            <div className={`flex-1 flex bg-black/5 pointer-events-auto p-3 ${className}`}>
                {children}
            </div>
        </div>,
        document.body
    );
}
