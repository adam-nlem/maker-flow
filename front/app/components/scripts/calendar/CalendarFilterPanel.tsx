import { Platform, platformOptions, platformToFrenchTranslation } from "~/models/enums/Platform";
import { ScriptStatus, scriptStatusToFrenchTranslation, scriptStatusToBgClass, scriptStatusToTextClass, scriptStatusToIcon } from "~/models/enums/ScriptStatus";
import { colorToBgClass, colorToTextClass } from "~/models/enums/Color";
import { useShowPlatformIcon } from "~/hooks/api/integrations/useShowPlatformIcon";
import { useListScriptTags } from "~/hooks/api/scriptTags/useListScriptTags";
import { useCalendarStore } from "~/stores/scripts/calendarStore";
import Pill from "~/components/ui/Pill";

function PlatformPill({ platform, isSelected, onToggle }: { platform: Platform; isSelected: boolean; onToggle: () => void }) {
    const { iconUrl } = useShowPlatformIcon(platform);

    if (!iconUrl) return null;

    return (
        <Pill
            imageUrl={iconUrl}
            label={platformToFrenchTranslation[platform]}
            isSelected={isSelected}
            onClick={onToggle}
            borderColorClassName="border-light-gray"
        />
    );
}

interface CalendarFilterPanelProps {
    projectUuid: string;
}

export default function CalendarFilterPanel({ projectUuid }: CalendarFilterPanelProps) {
    const { selectedPlatforms, selectedStatuses, selectedTagUuids, togglePlatform, toggleStatus, toggleTag } = useCalendarStore();
    const { scriptTags } = useListScriptTags({ projectUuid });

    const selectedPlatformSet = new Set(selectedPlatforms);
    const selectedStatusSet = new Set(selectedStatuses);
    const selectedTagSet = new Set(selectedTagUuids);

    return (
        <div className="flex flex-row gap-5 w-full shrink-0">
            {/* Platforms */}
            <div className="flex flex-col gap-2">
                <span className="text-heading-xs text-gray">Plateformes</span>
                <div className="flex flex-row flex-wrap gap-2">
                    {platformOptions.map((platform) => (
                        <PlatformPill
                            key={platform}
                            platform={platform}
                            isSelected={selectedPlatformSet.has(platform)}
                            onToggle={() => togglePlatform(platform)}
                        />
                    ))}
                </div>
            </div>

            {/* Statuses */}
            <div className="flex flex-col gap-2">
                <span className="text-heading-xs text-gray">Statuts</span>
                <div className="flex flex-row flex-wrap gap-2">
                    {Object.values(ScriptStatus).map((status) => (
                        <Pill
                            key={status}
                            icon={scriptStatusToIcon[status]}
                            label={scriptStatusToFrenchTranslation[status]}
                            isSelected={selectedStatusSet.has(status)}
                            onClick={() => toggleStatus(status)}
                            bgColorClassName={scriptStatusToBgClass[status]}
                            textColorClassName={scriptStatusToTextClass[status]}
                            borderColorClassName="border-light-gray"
                        />
                    ))}
                </div>
            </div>

            {/* Tags */}
            {scriptTags.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-heading-xs text-gray">Tags</span>
                    <div className="flex flex-row flex-wrap gap-2">
                        {scriptTags.map((tag) => (
                            <Pill
                                key={tag.uuid}
                                label={tag.title}
                                isSelected={selectedTagSet.has(tag.uuid)}
                                onClick={() => toggleTag(tag.uuid)}
                                bgColorClassName={colorToBgClass[tag.color]}
                                textColorClassName={colorToTextClass[tag.color]}
                                borderColorClassName="border-light-gray"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
