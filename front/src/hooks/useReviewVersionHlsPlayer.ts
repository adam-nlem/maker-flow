import { useEffect, useState, type RefObject } from "react";
import Hls from "hls.js";

interface UseReviewVersionHlsPlayerProps {
    videoElementRef: RefObject<HTMLVideoElement | null>;
    reviewVersionUuid: string;
    enabled: boolean;
}

function buildManifestUrl(reviewVersionUuid: string): string {
    return `${import.meta.env.VITE_API_URL}/api/review-versions/${reviewVersionUuid}/stream/master.m3u8`;
}

export function useReviewVersionHlsPlayer({
    videoElementRef,
    reviewVersionUuid,
    enabled,
}: UseReviewVersionHlsPlayerProps) {
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setError(null);

        if (!enabled) return;

        const video = videoElementRef.current;
        if (!video) return;

        const manifestUrl = buildManifestUrl(reviewVersionUuid);

        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr) => { xhr.withCredentials = true; },
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    setError(new Error(data.details));
                }
            });

            hls.loadSource(manifestUrl);
            hls.attachMedia(video);

            return () => {
                hls.destroy();
            };
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = manifestUrl;
            return () => {
                video.removeAttribute('src');
                video.load();
            };
        }

        setError(new Error('HLS playback is not supported by this browser'));
    }, [enabled, reviewVersionUuid, videoElementRef]);

    return { error };
}
