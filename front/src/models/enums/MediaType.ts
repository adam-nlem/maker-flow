import { FilmIcon, PhotoIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum MediaType {
    Image = 'image',
    Video = 'video',
    Carousel = 'carousel',
}

export const mediaTypeTranslationKeys: Record<MediaType, string> = {
    [MediaType.Image]: "enums:mediaType.image",
    [MediaType.Video]: "enums:mediaType.video",
    [MediaType.Carousel]: "enums:mediaType.carousel",
};

export const mediaTypeUploadHintTranslationKeys: Record<MediaType, string> = {
    [MediaType.Image]: "enums:mediaType.uploadHint.image",
    [MediaType.Video]: "enums:mediaType.uploadHint.video",
    [MediaType.Carousel]: "enums:mediaType.uploadHint.carousel",
};

export const mediaTypeToIcon: Record<MediaType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [MediaType.Video]: FilmIcon,
    [MediaType.Image]: PhotoIcon,
    [MediaType.Carousel]: RectangleStackIcon,
};

export const mediaTypeOptions = Object.values(MediaType)