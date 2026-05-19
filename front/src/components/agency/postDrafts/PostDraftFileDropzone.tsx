import { useTranslation } from "react-i18next";
import { ArrowUpTrayIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import FileUpload from "~/components/ui/FileUpload";
import { MediaType } from "~/models/enums/MediaType";
import { formatFileSize } from "~/utils/numberFormatters";
import {
    CAROUSEL_MAX_FILES,
    CAROUSEL_MIN_FILES,
    IMAGE_ACCEPT_ATTR,
    VIDEO_ACCEPT_ATTR,
} from "~/utils/postDraftFileValidation";

interface PostDraftFileDropzoneProps {
    mediaType: MediaType;
    files: File[];
    onChange: (files: File[]) => void;
    errorMessage?: string | null;
}

interface DropzoneSurfaceProps {
    isDragActive: boolean;
    hint: string;
}

function DropzoneSurface({ isDragActive, hint }: DropzoneSurfaceProps) {
    const baseClasses = "flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed transition-colors";
    const stateClasses = isDragActive
        ? "border-primary bg-primary/5 text-primary"
        : "border-pale-gray bg-clear-2 text-muted-2 hover:border-primary hover:bg-primary/5 hover:text-primary";

    return (
        <div className={`${baseClasses} ${stateClasses}`}>
            <ArrowUpTrayIcon className="size-8" strokeWidth={1.5} />
            <p className="text-body-sm">{hint}</p>
        </div>
    );
}

export default function PostDraftFileDropzone({ mediaType, files, onChange, errorMessage }: PostDraftFileDropzoneProps) {
    const { t } = useTranslation();

    const isMulti = mediaType === MediaType.Carousel;
    const accept = mediaType === MediaType.Video ? VIDEO_ACCEPT_ATTR : IMAGE_ACCEPT_ATTR;
    const hint = isMulti ? t("postDrafts:form.dropHintCarousel") : t("postDrafts:form.dropHint");

    const removeAt = (index: number) => onChange(files.filter((_, i) => i !== index));

    const swap = (a: number, b: number) => {
        if (a < 0 || b < 0 || a >= files.length || b >= files.length) return;
        const next = [...files];
        [next[a], next[b]] = [next[b], next[a]];
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-2">
            {isMulti ? (
                <FileUpload
                    multiple
                    accept={accept}
                    errorMessage={errorMessage}
                    onFilesSelected={(incoming) => onChange([...files, ...incoming].slice(0, CAROUSEL_MAX_FILES))}
                >
                    {({ isDragActive }) => <DropzoneSurface isDragActive={isDragActive} hint={hint} />}
                </FileUpload>
            ) : (
                <FileUpload
                    accept={accept}
                    errorMessage={errorMessage}
                    onFileSelected={(file) => onChange([file])}
                >
                    {({ isDragActive }) => <DropzoneSurface isDragActive={isDragActive} hint={hint} />}
                </FileUpload>
            )}

            {files.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                    {files.map((file, index) => (
                        <FileRow
                            key={`${file.name}-${index}`}
                            file={file}
                            position={isMulti ? index + 1 : null}
                            canMoveUp={isMulti && index > 0}
                            canMoveDown={isMulti && index < files.length - 1}
                            onMoveUp={() => swap(index, index - 1)}
                            onMoveDown={() => swap(index, index + 1)}
                            onRemove={() => removeAt(index)}
                        />
                    ))}
                </ul>
            )}

            {isMulti && files.length > 0 && files.length < CAROUSEL_MIN_FILES && (
                <p className="text-body-xs text-muted-2">{t("postDrafts:validation.fileRequiredCarousel")}</p>
            )}
        </div>
    );
}

interface FileRowProps {
    file: File;
    position: number | null;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}

function FileRow({ file, position, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onRemove }: FileRowProps) {
    const isReorderable = position !== null;

    return (
        <li className="flex flex-row items-center gap-2 rounded-xl border border-pale-gray px-3 py-2">
            {isReorderable && (
                <span className="text-body-xs text-muted-2 w-6">#{position}</span>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-body-sm text-dark truncate">{file.name}</p>
                <p className="text-body-xs text-muted-2">{formatFileSize(file.size)}</p>
            </div>

            {isReorderable && (
                <div className="flex flex-row gap-1">
                    <ReorderButton onClick={onMoveUp} disabled={!canMoveUp}>
                        <ChevronUpIcon className="size-4" strokeWidth={2} />
                    </ReorderButton>
                    <ReorderButton onClick={onMoveDown} disabled={!canMoveDown}>
                        <ChevronDownIcon className="size-4" strokeWidth={2} />
                    </ReorderButton>
                </div>
            )}

            <button
                type="button"
                onClick={onRemove}
                className="text-danger hover:text-dark cursor-pointer"
            >
                <TrashIcon className="size-4" strokeWidth={2} />
            </button>
        </li>
    );
}

interface ReorderButtonProps {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}

function ReorderButton({ onClick, disabled, children }: ReorderButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="text-muted-2 hover:text-dark disabled:opacity-30 cursor-pointer px-1"
        >
            {children}
        </button>
    );
}
