import { useTranslation } from "react-i18next";
import {
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import { formatDurationToClock } from "~/utils/durationFormatters";
import ReviewVideoSeekBar from "./ReviewVideoSeekBar";

interface ReviewVideoControlsBarProps {
    reviewVersionUuid: string;
    showMarkers: boolean;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    bufferedEnd: number;
    isFullscreen: boolean;
    onTogglePlayPause: () => void;
    onSeek: (seconds: number) => void;
    onSetVolume: (value: number) => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
}

export default function ReviewVideoControlsBar({
    reviewVersionUuid,
    showMarkers,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    bufferedEnd,
    isFullscreen,
    onTogglePlayPause,
    onSeek,
    onSetVolume,
    onToggleMute,
    onToggleFullscreen,
}: ReviewVideoControlsBarProps) {
    const { t } = useTranslation();
    const displayVolume = isMuted ? 0 : volume;
    const isSilent = isMuted || volume === 0;

    return (
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-8 flex flex-col gap-2 bg-gradient-to-t from-dark/80 to-transparent">
            <ReviewVideoSeekBar
                reviewVersionUuid={reviewVersionUuid}
                showMarkers={showMarkers}
                currentTime={currentTime}
                duration={duration}
                bufferedEnd={bufferedEnd}
                onSeek={onSeek}
            />
            <div className="flex flex-row items-center gap-3">
                <button
                    type="button"
                    onClick={onTogglePlayPause}
                    aria-label={isPlaying ? t("reviews:detail.video.player.pause") : t("reviews:detail.video.player.play")}
                    className="text-clear hover:text-primary cursor-pointer"
                >
                    {isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
                </button>

                <div className="group/volume flex flex-row items-center gap-1">
                    <button
                        type="button"
                        onClick={onToggleMute}
                        aria-label={isSilent ? t("reviews:detail.video.player.unmute") : t("reviews:detail.video.player.mute")}
                        className="text-clear hover:text-primary cursor-pointer"
                    >
                        {isSilent ? <SpeakerXMarkIcon className="size-5" /> : <SpeakerWaveIcon className="size-5" />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={displayVolume}
                        onChange={(e) => onSetVolume(Number(e.target.value))}
                        aria-label={t("reviews:detail.video.player.volume")}
                        className="hidden group-hover/volume:inline group-hover/volume:w-20 group-focus-within/volume:w-20 transition-all accent-primary cursor-pointer"
                    />
                </div>

                <span className="text-clear text-xs tabular-nums">
                    {formatDurationToClock(currentTime)} / {formatDurationToClock(duration)}
                </span>

                <div className="flex-1" />

                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    aria-label={isFullscreen ? t("reviews:detail.video.player.exitFullscreen") : t("reviews:detail.video.player.enterFullscreen")}
                    className="text-clear hover:text-primary cursor-pointer"
                >
                    {isFullscreen ? <ArrowsPointingInIcon className="size-5" /> : <ArrowsPointingOutIcon className="size-5" />}
                </button>
            </div>
        </div>
    );
}
