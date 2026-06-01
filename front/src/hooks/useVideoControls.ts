import { useCallback, useEffect, useState, type RefObject } from "react";

interface UseVideoControlsProps {
    videoElementRef: RefObject<HTMLVideoElement | null>;
    containerRef: RefObject<HTMLElement | null>;
}

export function useVideoControls({ videoElementRef, containerRef }: UseVideoControlsProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolumeState] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bufferedEnd, setBufferedEnd] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const video = videoElementRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onDurationChange = () =>
            setDuration(Number.isFinite(video.duration) ? video.duration : 0);
        const onVolumeChange = () => {
            setIsMuted(video.muted);
            setVolumeState(video.volume);
        };
        const onProgress = () => {
            if (video.buffered.length > 0) {
                setBufferedEnd(video.buffered.end(video.buffered.length - 1));
            }
        };
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onCanPlay = () => setIsBuffering(false);

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('durationchange', onDurationChange);
        video.addEventListener('volumechange', onVolumeChange);
        video.addEventListener('progress', onProgress);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('canplay', onCanPlay);

        setIsPlaying(!video.paused);
        setIsMuted(video.muted);
        setVolumeState(video.volume);
        setCurrentTime(video.currentTime);
        setDuration(Number.isFinite(video.duration) ? video.duration : 0);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('durationchange', onDurationChange);
            video.removeEventListener('volumechange', onVolumeChange);
            video.removeEventListener('progress', onProgress);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('canplay', onCanPlay);
        };
    }, [videoElementRef]);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, [containerRef]);

    const play = useCallback(() => {
        videoElementRef.current?.play().catch(() => { });
    }, [videoElementRef]);

    const pause = useCallback(() => {
        videoElementRef.current?.pause();
    }, [videoElementRef]);

    const togglePlayPause = useCallback(() => {
        const video = videoElementRef.current;
        if (!video) return;
        if (video.paused) video.play().catch(() => { });
        else video.pause();
    }, [videoElementRef]);

    const seekTo = useCallback((seconds: number) => {
        const video = videoElementRef.current;
        if (!video) return;
        const max = Number.isFinite(video.duration) ? video.duration : 0;
        video.currentTime = Math.max(0, Math.min(max, seconds));
    }, [videoElementRef]);

    const seekBy = useCallback((delta: number) => {
        const video = videoElementRef.current;
        if (!video) return;
        seekTo(video.currentTime + delta);
    }, [videoElementRef, seekTo]);

    const setVolume = useCallback((value: number) => {
        const video = videoElementRef.current;
        if (!video) return;
        const clamped = Math.max(0, Math.min(1, value));
        video.volume = clamped;
        if (clamped > 0 && video.muted) video.muted = false;
    }, [videoElementRef]);

    const toggleMute = useCallback(() => {
        const video = videoElementRef.current;
        if (!video) return;
        video.muted = !video.muted;
    }, [videoElementRef]);

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        } else {
            container.requestFullscreen().catch(() => { });
        }
    }, [containerRef]);

    return {
        isPlaying,
        isMuted,
        volume,
        currentTime,
        duration,
        bufferedEnd,
        isBuffering,
        isFullscreen,
        play,
        pause,
        togglePlayPause,
        seekTo,
        seekBy,
        setVolume,
        toggleMute,
        toggleFullscreen,
    };
}
