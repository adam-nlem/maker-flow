import { useState } from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { platformOptions } from "~/models/enums/Platform";
import { scriptStatusOptions, scriptStatusTranslationKeys, scriptStatusToBgClass, scriptStatusToTextClass, scriptStatusToIcon, scriptStatusToBorderClass } from "~/models/enums/ScriptStatus";
import { colorToBgClass, colorToBorderClass, colorToTextClass } from "~/models/enums/Color";
import { useListScriptTags } from "~/hooks/api/scriptTags/useListScriptTags";
import { useCalendarStore } from "~/stores/scripts/calendarStore";
import Pill from "~/components/ui/Pill";
import PlatformPill from "~/components/ui/PlatformPill";

interface CalendarFilterPanelProps {
    projectUuid: string;
}

export default function CalendarFilterPanel({ projectUuid }: CalendarFilterPanelProps) {
    const { t } = useTranslation();
    const { selectedPlatforms, selectedStatuses, selectedTagUuids, togglePlatform, toggleStatus, toggleTag } = useCalendarStore();
    const { scriptTags } = useListScriptTags({ projectUuid });
    const isDesktop = useIsDesktop();
    const [isExpanded, setIsExpanded] = useState(false);

    const selectedPlatformSet = new Set(selectedPlatforms);
    const selectedStatusSet = new Set(selectedStatuses);
    const selectedTagSet = new Set(selectedTagUuids);

    const activeFilterCount = selectedPlatforms.length + selectedStatuses.length + selectedTagUuids.length;

    const filterSections = (
        <>
            {/* Platforms */}
            <div className="flex flex-col gap-2">
                <span className="text-heading-xs text-gray">{t("scripts:calendar.filters.platforms")}</span>
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
                <span className="text-heading-xs text-gray">{t("scripts:calendar.filters.statuses")}</span>
                <div className="flex flex-row flex-wrap gap-2">
                    {scriptStatusOptions.map((status) => (
                        <Pill
                            key={status}
                            icon={scriptStatusToIcon[status]}
                            label={t(scriptStatusTranslationKeys[status])}
                            isSelected={selectedStatusSet.has(status)}
                            onClick={() => toggleStatus(status)}
                            bgColorClassName={scriptStatusToBgClass[status]}
                            textColorClassName={scriptStatusToTextClass[status]}
                            borderColorClassName={scriptStatusToBorderClass[status]}
                        />
                    ))}
                </div>
            </div>

            {/* Tags */}
            {scriptTags.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-heading-xs text-gray">{t("scripts:calendar.filters.tags")}</span>
                    <div className="flex flex-row flex-wrap gap-2">
                        {scriptTags.map((tag) => (
                            <Pill
                                key={tag.uuid}
                                label={tag.title}
                                isSelected={selectedTagSet.has(tag.uuid)}
                                onClick={() => toggleTag(tag.uuid)}
                                bgColorClassName={colorToBgClass[tag.color]}
                                textColorClassName={colorToTextClass[tag.color]}
                                borderColorClassName={colorToBorderClass[tag.color]}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    if (!isDesktop) {
        return (
            <div className="shrink-0">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex flex-row items-center gap-2 px-3 py-2 border border-light-gray rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                >
                    <AdjustmentsHorizontalIcon className="size-4 text-gray" />
                    <span className="text-heading-xs text-gray">{t("scripts:calendar.filters.title")}</span>
                    {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-body-xs font-semibold">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {isExpanded && (
                    <div className="flex flex-col gap-3 pt-3 animate-fade-in">
                        {filterSections}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="shrink-0 flex flex-row gap-5 w-full">
            {filterSections}
        </div>
    );
}
