import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Shimmer from "~/components/ui/Shimmer";
import { useShowAgencyUsage } from "~/hooks/api/agency/useShowAgencyUsage";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import { formatFileSize } from "~/utils/numberFormatters";

interface UsageRow {
    label: string;
    used: number;
    limit: number | null;
    format: (value: number) => string;
}

const formatCount = (value: number): string => `${value}`;
const formatDuration = (seconds: number): string => formatDurationToFrench(seconds, 2);

export default function UsageOverview() {
    const { t } = useTranslation();
    const { usage, isLoading } = useShowAgencyUsage();

    if (isLoading) {
        return (
            <div className="border border-pale-gray rounded-xl p-5 flex flex-col gap-4">
                <Shimmer width="w-32" height="h-5" />
                <Shimmer width="w-full" height="h-4" />
                <Shimmer width="w-full" height="h-4" />
                <Shimmer width="w-full" height="h-4" />
            </div>
        );
    }

    if (!usage) return null;

    const rows: UsageRow[] = [
        {
            label: t("settings:subscription.usage.editorCollaborators"),
            used: usage.editorCollaboratorsUsed,
            limit: usage.editorCollaboratorsLimit,
            format: formatCount,
        },
        {
            label: t("settings:subscription.usage.videoHours"),
            used: usage.videoSecondsUsed,
            limit: usage.videoSecondsLimit,
            format: formatDuration,
        },
        {
            label: t("settings:subscription.usage.storage"),
            used: usage.storageBytesUsed,
            limit: usage.storageBytesLimit,
            format: formatFileSize,
        },
    ];

    return (
        <div className="border border-pale-gray rounded-xl p-5">
            <div className="flex flex-row items-center gap-2 mb-4">
                <ChartBarIcon className="size-5 text-muted-2" strokeWidth={1.5} />
                <h3 className="text-heading-md">{t("settings:subscription.usage.title")}</h3>
            </div>

            <div className="flex flex-col gap-4">
                {rows.map((row) => (
                    <UsageBar key={row.label} {...row} />
                ))}
            </div>
        </div>
    );
}

function UsageBar({ label, used, limit, format }: UsageRow) {
    const { t } = useTranslation();

    let valueLabel: string;
    let percent = 0;
    let barClass = "bg-primary";

    if (limit === null) {
        valueLabel = `${format(used)} · ${t("settings:subscription.usage.unlimited")}`;
    } else if (limit === 0) {
        valueLabel = t("settings:subscription.usage.upgradeToUnlock");
        barClass = "bg-pale-gray-2";
    } else {
        valueLabel = `${format(used)} / ${format(limit)}`;
        percent = Math.min(100, Math.round((used / limit) * 100));
        if (percent >= 100) {
            barClass = "bg-danger";
        } else if (percent >= 80) {
            barClass = "bg-yellow";
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center justify-between">
                <p className="text-heading-sm">{label}</p>
                <p className="text-body-sm text-muted">{valueLabel}</p>
            </div>
            <div className="h-2 w-full rounded-full bg-clear-3 overflow-hidden">
                <div
                    className={`h-full ${barClass} transition-all`}
                    style={{ width: `${limit === null ? 100 : percent}%` }}
                />
            </div>
        </div>
    );
}
