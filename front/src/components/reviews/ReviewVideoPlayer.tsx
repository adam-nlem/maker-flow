import { useEffect, useRef, type RefObject } from "react";
import { useReviewVersionHlsPlayer } from "~/hooks/useReviewVersionHlsPlayer";
import { useVideoControls } from "~/hooks/useVideoControls";
import { useIdleAutoHide } from "~/hooks/useIdleAutoHide";
import { VideoStreamingStatus } from "~/models/enums/VideoStreamingStatus";
import ReviewVideoControlsBar from "./ReviewVideoControlsBar";

interface ReviewVideoPlayerProps {
  reviewVersionUuid: string;
  videoStreamingStatus: VideoStreamingStatus | null;
  videoElementRef: RefObject<HTMLVideoElement | null>;
  src?: string | null;
  posterUrl?: string | null;
  onLoadedMetadata?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  onPlaybackError?: (error: Error) => void;
}

export default function ReviewVideoPlayer({
  reviewVersionUuid,
  videoStreamingStatus,
  videoElementRef,
  src,
  posterUrl,
  onLoadedMetadata,
  onPlaybackError,
}: ReviewVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const controls = useVideoControls({ videoElementRef, containerRef });
  const { error: hlsError } = useReviewVersionHlsPlayer({
    videoElementRef,
    reviewVersionUuid,
    enabled: videoStreamingStatus === VideoStreamingStatus.Ready,
  });

  useEffect(() => {
    if (hlsError && onPlaybackError) onPlaybackError(hlsError);
  }, [hlsError, onPlaybackError]);

  const isHidden = useIdleAutoHide({
    activityRef: containerRef,
    isActive: controls.isPlaying,
  });

  const handleVideoClick = () => {
    containerRef.current?.focus();
    controls.togglePlayPause();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative w-full bg-dark outline-none [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center"
    >
      <video
        ref={videoElementRef}
        src={src ?? undefined}
        poster={posterUrl ?? undefined}
        className="w-full max-h-[50vh] bg-dark cursor-pointer [:fullscreen_&]:max-h-full [:fullscreen_&]:h-full [:fullscreen_&]:object-contain"
        preload="metadata"
        onClick={handleVideoClick}
        onLoadedMetadata={onLoadedMetadata}
      />
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${isHidden ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="pointer-events-auto">
          <ReviewVideoControlsBar
            reviewVersionUuid={reviewVersionUuid}
            showMarkers={videoStreamingStatus !== null}
            isPlaying={controls.isPlaying}
            isMuted={controls.isMuted}
            volume={controls.volume}
            currentTime={controls.currentTime}
            duration={controls.duration}
            bufferedEnd={controls.bufferedEnd}
            isFullscreen={controls.isFullscreen}
            onTogglePlayPause={controls.togglePlayPause}
            onSeek={controls.seekTo}
            onSetVolume={controls.setVolume}
            onToggleMute={controls.toggleMute}
            onToggleFullscreen={controls.toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
