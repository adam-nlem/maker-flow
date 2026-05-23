import { useTranslation } from "react-i18next";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { Tag } from "~/components/ui/Tag";
import { ReviewVersion } from "~/models/ReviewVersion";
import {
    ReviewStatus,
    reviewStatusToBgClass,
    reviewStatusToIcon,
    reviewStatusToTextClass,
    reviewStatusTranslationKeys,
} from "~/models/enums/ReviewStatus";
import { formatToRelative } from "~/utils/dateFormatters";

interface ReviewVersionDropdownProps {
    versions: ReviewVersion[];
    activeVersionUuid: string;
    onSelect: (versionUuid: string) => void;
}

export default function ReviewVersionDropdown({
    versions,
    activeVersionUuid,
    onSelect,
}: ReviewVersionDropdownProps) {
    const { t } = useTranslation();

    const total = versions.length;
    const newestFirst = [...versions].sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
    });
    const orderByUuid = new Map(newestFirst.map((version, index) => [version.uuid, total - index]));
    const activeVersion = newestFirst.find((v) => v.uuid === activeVersionUuid) ?? newestFirst[0];
    const activeOrder = activeVersion ? orderByUuid.get(activeVersion.uuid) ?? total : total;

    return (
        <div className="mb-3">
            <SelectDropdown
                items={newestFirst}
                selectedItemId={activeVersionUuid}
                getItemId={(version) => version.uuid}
                onSelect={(version) => onSelect(version.uuid)}
                renderTrigger={({ onClick }) => (
                    <button
                        type="button"
                        onClick={onClick}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-pale-gray bg-clear hover:bg-clear-2 transition-colors cursor-pointer"
                    >
                        <span className="text-body-sm text-dark">
                            {t("reviews:versions.switcher.trigger", { number: activeOrder, total })}
                        </span>
                        {activeVersion?.createdAt && (
                            <span className="text-body-xs text-muted-2">
                                · {t("reviews:versions.switcher.uploaded", {
                                    relative: formatToRelative(new Date(activeVersion.createdAt)),
                                })}
                            </span>
                        )}
                        <ChevronUpDownIcon className="size-4 text-muted-2" />
                    </button>
                )}
                renderItem={({ item, onSelect }) => {
                    const order = orderByUuid.get(item.uuid) ?? total;
                    const status = item.status ?? ReviewStatus.Pending;

                    return (
                        <button
                            type="button"
                            onClick={onSelect}
                            className="flex flex-col gap-1 text-left px-2 py-1 rounded-lg transition-colors cursor-pointer hover:bg-clear-2 w-64"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-heading-sm text-dark">
                                    {t("reviews:versions.switcher.trigger", { number: order, total })}
                                </span>
                                <Tag
                                    icon={reviewStatusToIcon[status]}
                                    label={t(reviewStatusTranslationKeys[status])}
                                    bgClassName={reviewStatusToBgClass[status]}
                                    textClassName={reviewStatusToTextClass[status]}
                                />
                            </div>
                            {item.createdAt && (
                                <span className="text-body-xs text-muted-2">
                                    {t("reviews:versions.switcher.uploaded", {
                                        relative: formatToRelative(new Date(item.createdAt)),
                                    })}
                                </span>
                            )}
                        </button>
                    );
                }}
            />
        </div>
    );
}
