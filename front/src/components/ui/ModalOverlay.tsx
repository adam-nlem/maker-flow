import { createPortal } from "react-dom";
import { useEffect, useCallback } from "react";

interface ModalOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
    height?: string;
}

export default function ModalOverlay({ isOpen, onClose, children, width = "w-200", height = "h-[80vh]" }: ModalOverlayProps) {
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
            className="fixed inset-0 z-50 pointer-events-none"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="w-full h-full flex bg-black/40 pointer-events-auto justify-center items-center">
                {/* Modal container */}
                <div
                    className={`${width} ${height} border rounded-xl border-light-gray shadow-lg bg-clear flex flex-col overflow-y-auto`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
