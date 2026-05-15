import { MediaType } from "~/models/enums/MediaType";

export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const CAROUSEL_MIN_FILES = 2;
export const CAROUSEL_MAX_FILES = 10;
export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/quicktime", "video/webm"];
export const ALLOWED_IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"];

export const VIDEO_ACCEPT_ATTR = ALLOWED_VIDEO_MIMES.join(",");
export const IMAGE_ACCEPT_ATTR = ALLOWED_IMAGE_MIMES.join(",");

/**
 * Validates the file selection for a given media type.
 * Returns an i18n key for the first failing rule, or null when the selection is valid.
 * Mirrors PostDraftFileService::validateFiles on the backend.
 */
export function validatePostDraftFiles(mediaType: MediaType, files: File[]): string | null {
    if (mediaType === MediaType.Video) {
        if (files.length !== 1) return "postDrafts:validation.fileRequiredVideo";
        const file = files[0];
        if (file.size > MAX_VIDEO_BYTES) return "postDrafts:validation.videoTooLarge";
        if (!ALLOWED_VIDEO_MIMES.includes(file.type)) return "postDrafts:validation.invalidMime";
        return null;
    }

    if (mediaType === MediaType.Image) {
        if (files.length !== 1) return "postDrafts:validation.fileRequiredImage";
        return validateImage(files[0]);
    }

    if (files.length < CAROUSEL_MIN_FILES || files.length > CAROUSEL_MAX_FILES) {
        return "postDrafts:validation.fileRequiredCarousel";
    }

    for (const file of files) {
        const error = validateImage(file);
        if (error) return error;
    }

    return null;
}

function validateImage(file: File): string | null {
    if (file.size > MAX_IMAGE_BYTES) return "postDrafts:validation.imageTooLarge";
    if (!ALLOWED_IMAGE_MIMES.includes(file.type)) return "postDrafts:validation.invalidMime";
    return null;
}
