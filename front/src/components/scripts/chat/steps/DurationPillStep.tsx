import Pill from "~/components/ui/Pill";
import { type VideoDuration, videoDurationOptions, videoDurationToFrenchTranslation } from "~/models/enums/VideoDuration";

interface DurationPillStepProps {
    onSelect: (duration: VideoDuration) => void;
}

export default function DurationPillStep({ onSelect }: DurationPillStepProps) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-body-sm text-gray">Quelle durée pour la vidéo ?</p>
            <div className="flex flex-row flex-wrap gap-2">
                {videoDurationOptions.map((duration) => (
                    <Pill
                        key={duration}
                        label={videoDurationToFrenchTranslation[duration]}
                        onClick={() => onSelect(duration)}
                    />
                ))}
            </div>
        </div>
    );
}
