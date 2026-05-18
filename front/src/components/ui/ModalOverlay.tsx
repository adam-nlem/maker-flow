import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { ModalAlign } from "~/models/enums/ModalAlign";

interface ModalOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
    height?: string;
    align?: ModalAlign;
    /**
     * When true, the overlay does not paint its own dark backdrop. Use this when stacking
     * an overlay on top of another open overlay so a single shared backdrop stays visible
     * behind both modals.
     */
    nested?: boolean;
}

const modalStack: Array<() => void> = [];
let activeCount = 0;

const alignmentClass: Record<ModalAlign, string> = {
    [ModalAlign.Center]: "",
    [ModalAlign.LeftOfCenter]: "translate-x-[calc(-50%-6px)]",
    [ModalAlign.RightOfCenter]: "translate-x-[calc(50%+6px)]",
};

export default function ModalOverlay({ isOpen, onClose, children, width = "w-200", height = "h-[80vh]", align = ModalAlign.Center, nested = false }: ModalOverlayProps) {
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; });

    useEffect(() => {
        if (!isOpen) return;
        const close = () => onCloseRef.current();
        modalStack.push(close);
        activeCount++;
        document.body.style.overflow = "hidden";

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (modalStack[modalStack.length - 1] !== close) return;
            close();
        };
        document.addEventListener("keydown", handleEscape);

        return () => {
            const idx = modalStack.indexOf(close);
            if (idx !== -1) modalStack.splice(idx, 1);
            document.removeEventListener("keydown", handleEscape);
            activeCount--;
            if (activeCount === 0) document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 pointer-events-none"
            onClick={() => onCloseRef.current()}
        >
            <div className={`w-full h-full flex pointer-events-auto justify-center items-center ${nested ? "" : "bg-black/40"}`}>
                <div
                    className={`${width} ${height} ${alignmentClass[align]} border rounded-xl border-pale-gray bg-clear flex flex-col overflow-hidden transition-transform duration-200 ease-out`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
