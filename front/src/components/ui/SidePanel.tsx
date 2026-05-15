import type { ComponentType, ReactNode, RefObject, SVGProps } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useIsDesktop } from "~/hooks/useIsDesktop";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;
type PanelWidth = "w-72" | "w-120";

interface SidePanelProps {
    title?: string;
    icon?: HeroIcon;
    width?: PanelWidth;
    side?: "left" | "right";
    isOpen?: boolean;
    onClose?: () => void;
    headerActions?: ReactNode;
    header?: ReactNode;
    toolbar?: ReactNode;
    footer?: ReactNode;
    bodyRef?: RefObject<HTMLDivElement | null>;
    children: ReactNode;
}

const panelMinWidth: Record<PanelWidth, string> = {
    "w-72": "min-w-72",
    "w-120": "min-w-120",
};

function PanelContent({
    title,
    icon: Icon,
    borderClass,
    onClose,
    headerActions,
    header,
    toolbar,
    footer,
    bodyRef,
    className,
    children,
}: {
    title?: string;
    icon?: HeroIcon;
    borderClass: string;
    onClose?: () => void;
    headerActions?: ReactNode;
    header?: ReactNode;
    toolbar?: ReactNode;
    footer?: ReactNode;
    bodyRef?: RefObject<HTMLDivElement | null>;
    className: string;
    children: ReactNode;
}) {
    return (
        <div className={`shrink-0 ${borderClass} border-pale-gray h-full flex flex-col bg-clear ${className}`}>
            {header ?? (
                <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-pale-gray">
                    <div className="flex flex-row items-center gap-2">
                        {Icon && <Icon className="size-5 text-primary" strokeWidth={2} />}
                        <h2 className="text-heading-md">{title}</h2>
                    </div>
                    {(headerActions || onClose) && (
                        <div className="flex flex-row items-center gap-2">
                            {headerActions}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="text-muted-2 hover:text-dark transition-colors cursor-pointer"
                                >
                                    <XMarkIcon className="size-4" strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {toolbar}

            {/* Scrollable body */}
            <div ref={bodyRef} className="flex-1 overflow-y-auto scrollbar-none">
                {children}
            </div>

            {/* Sticky footer */}
            {footer && (
                <div className="px-4 py-3 border-t border-pale-gray">
                    {footer}
                </div>
            )}
        </div>
    );
}

export function SidePanel({
    title,
    icon,
    width = "w-72",
    side = "right",
    isOpen,
    onClose,
    headerActions,
    header,
    toolbar,
    footer,
    bodyRef,
    children,
}: SidePanelProps) {
    const borderClass = side === "left" ? "border-r" : "border-l";
    const minWidthClass = panelMinWidth[width];
    const isCollapsible = isOpen !== undefined;

    const panelProps = { title, icon, borderClass, onClose, headerActions, header, toolbar, footer, bodyRef, children };

    const isDesktop = useIsDesktop();

    if (isCollapsible) {
        if (isDesktop) {
            return (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? width : "w-0"}`}>
                    <PanelContent {...panelProps} className={`${width} ${minWidthClass}`} />
                </div>
            );
        }

        if (isOpen) {
            return (
                <div className="fixed top-12 left-0 right-0 bottom-0 z-40">
                    <PanelContent {...panelProps} className="w-full" />
                </div>
            );
        }

        return null;
    }

    return (
        <PanelContent {...panelProps} className={`${width} ${minWidthClass}`} />
    );
}
