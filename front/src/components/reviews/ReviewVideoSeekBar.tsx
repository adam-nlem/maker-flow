import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useListPaginatedReviewComments } from "~/hooks/api/reviews/useListPaginatedReviewComments";
import { formatDurationToClock } from "~/utils/durationFormatters";

interface ReviewVideoSeekBarProps {
    reviewVersionUuid: string;
    currentTime: number;
    duration: number;
    bufferedEnd: number;
    onSeek: (seconds: number) => void;
    showMarkers: boolean;
}

export default function ReviewVideoSeekBar({
    reviewVersionUuid,
    currentTime,
    duration,
    bufferedEnd,
    onSeek,
    showMarkers,
}: ReviewVideoSeekBarProps) {
    const { t } = useTranslation();
    const { comments } = useListPaginatedReviewComments({ reviewVersionUuid });

    const pinnedTimecodes = useMemo(() => {
        if (!showMarkers || duration <= 0) return [];
        return comments
            .filter((c) => c.videoTimecodeSeconds !== null && c.videoTimecodeSeconds <= duration)
            .map((c) => ({ uuid: c.uuid, seconds: c.videoTimecodeSeconds as number }));
    }, [comments, duration, showMarkers]);

    const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (Math.min(bufferedEnd, duration) / duration) * 100 : 0;

    return (
        <div className="group/seek relative w-full h-1 hover:h-1.5 transition-all">
            <div className="absolute inset-0 bg-clear/30 rounded-full" />
            <div
                className="absolute inset-y-0 left-0 bg-clear/50 rounded-full"
                style={{ width: `${bufferedPercent}%` }}
            />
            <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                style={{ width: `${playedPercent}%` }}
            />
            <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.01}
                value={currentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
                aria-label={t("reviews:detail.video.player.seek")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pinnedTimecodes.map((pin) => {
                const offset = duration > 0 ? (pin.seconds / duration) * 100 : 0;
                return (
                    <button
                        key={pin.uuid}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSeek(pin.seconds);
                        }}
                        aria-label={formatDurationToClock(pin.seconds)}
                        title={formatDurationToClock(pin.seconds)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full bg-yellow hover:scale-150 transition-transform cursor-pointer"
                        style={{ left: `${offset}%` }}
                    />
                );
            })}
        </div>
    );
}
