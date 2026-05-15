import { useRef, useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface FileUploadProps {
    accept: string;
    onFileSelected: (file: File) => void | Promise<void>;
    hint?: string;
    errorMessage?: string | null;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    isPending?: boolean;
    className?: string;
    children?: (state: { isDragActive: boolean }) => ReactNode;
}

const DEFAULT_BUTTON_CLASSES = "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed transition-colors";
const DEFAULT_BUTTON_IDLE = "border-pale-gray bg-clear hover:bg-pale-gray-2/30";
const DEFAULT_BUTTON_DRAGGING = "border-primary bg-primary/10";

export default function FileUpload({
    accept,
    onFileSelected,
    hint,
    errorMessage,
    icon: Icon = ArrowUpTrayIcon,
    isPending = false,
    className = "",
    children,
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handlePick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) await onFileSelected(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isDragActive) setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) await onFileSelected(file);
    };

    const buttonProps = {
        type: "button" as const,
        onClick: handlePick,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        disabled: isPending,
    };

    const baseButtonClasses = "group w-full flex-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {children ? (
                <button {...buttonProps} className={baseButtonClasses}>
                    {children({ isDragActive })}
                </button>
            ) : (
                <button
                    {...buttonProps}
                    className={`${baseButtonClasses} ${DEFAULT_BUTTON_CLASSES} ${isDragActive ? DEFAULT_BUTTON_DRAGGING : DEFAULT_BUTTON_IDLE}`}
                >
                    <Icon className="size-10 text-muted-2" strokeWidth={1.2} />
                    {hint && <p className="text-body-xs text-muted-2">{hint}</p>}
                </button>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
            {errorMessage && (
                <p className="text-body-sm text-danger">{errorMessage}</p>
            )}
        </div>
    );
}
