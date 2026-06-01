import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface FileUploadBaseProps {
  accept: string;
  hint?: string;
  errorMessage?: string | null;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  isPending?: boolean;
  className?: string;
  children?: (state: { isDragActive: boolean }) => ReactNode;
}

type FileUploadProps = FileUploadBaseProps & (
  | { multiple?: false; onFileSelected: (file: File, previewUrl: string | null) => void | Promise<void>; onFilesSelected?: never }
  | { multiple: true; onFilesSelected: (files: File[]) => void | Promise<void>; onFileSelected?: never }
);

const DEFAULT_BUTTON_CLASSES = "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed transition-colors";
const DEFAULT_BUTTON_IDLE = "border-pale-gray bg-clear hover:bg-pale-gray-2/30";
const DEFAULT_BUTTON_DRAGGING = "border-primary bg-primary/10";

export default function FileUpload(props: FileUploadProps) {
  const {
    accept,
    hint,
    errorMessage,
    icon: Icon = ArrowUpTrayIcon,
    isPending = false,
    className = "",
    children,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  useEffect(() => {
    // Deletes the old privewUrl to prevent memory leaks
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  const emit = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (props.multiple) {
      await props.onFilesSelected(Array.from(fileList));
    } else {
      const file = fileList[0]
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      await props.onFileSelected(file, url);
    }
  };

  const handlePick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    await emit(target.files);
    target.value = "";
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
    await emit(e.dataTransfer.files);
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
      <button
        {...buttonProps}
        className={children
          ? baseButtonClasses
          : `${baseButtonClasses} ${DEFAULT_BUTTON_CLASSES} ${isDragActive ? DEFAULT_BUTTON_DRAGGING : DEFAULT_BUTTON_IDLE}`}
      >
        {children ? (
          children({ isDragActive })
        ) : previewUrl ? (<><img src={previewUrl} alt="" className="w-30 rounded-md object-cover" />
          <p className="text-sm text-muted-2">Your agency logo has been uploaded!</p>
        </>) :
          (<>
            <Icon className="size-10 text-muted-2" strokeWidth={1.2} />
            {hint && <p className="text-body-xs text-muted-2">{hint}</p>}
          </>)}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={props.multiple ?? false}
        onChange={handleChange}
        className="hidden"
      />
      {errorMessage && (
        <p className="text-body-sm text-danger">{errorMessage}</p>
      )}
    </div>
  );
}
