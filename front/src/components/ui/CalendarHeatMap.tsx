import { useTranslation } from "react-i18next";
import type { ChartDataPoint } from "~/utils/chartDataHelpers";
import { formatToIso8601Tz } from "~/utils/dateFormatters";

interface CalendarHeatMapProps {
    data: ChartDataPoint[];
    totalValue: number;
    daysToDisplay: number;
}

interface HeatMapCell {
    date: Date | null;
    value: number;
}

export function CalendarHeatMap({
    data,
    totalValue,
    daysToDisplay,
}: CalendarHeatMapProps) {
    const { t } = useTranslation();
    const weeksGrid = buildWeeksGrid(data, daysToDisplay);

    if (weeksGrid.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1 border border-pale-gray rounded-lg p-2">
            <h1 className="text-heading-xs">{t("calendarHeatmap.title")}</h1>
            <h2 className="text-heading-sm">{totalValue}</h2>
            <div className="flex gap-1 p-2">



                {weeksGrid.map((week, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {week.map((day, j) => (
                            <div
                                key={j}
                                title={
                                    day.date
                                        ? `${formatToIso8601Tz(day.date)} – ${day.value}`
                                        : ""
                                }
                                className={`h-3 w-3 rounded-sm ${getColor(day.value)}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function buildWeeksGrid(data: ChartDataPoint[], daysToDisplay: number): HeatMapCell[][] {
    if (data.length === 0) {
        return [];
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToDisplay);

    const dataMap = new Map(
        data.map((d) => [formatToIso8601Tz(d.date), d.value])
    );

    const days: HeatMapCell[] = [];
    for (
        let d = new Date(startDate);
        d <= today;
        d.setDate(d.getDate() + 1)
    ) {
        days.push({
            date: new Date(d),
            value: dataMap.get(formatToIso8601Tz(d)) ?? 0,
        });
    }

    // Pad start so weeks align (Sunday first)
    const firstDay = days[0].date!.getDay();
    for (let i = 0; i < firstDay; i++) {
        days.unshift({ date: null, value: 0 });
    }

    const weeks: HeatMapCell[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return weeks;
}

function getColor(count: number) {
    if (count === 0) return "bg-pale-gray-2";
    if (count < 1000) return "bg-primary/20";
    if (count < 5000) return "bg-primary/40";
    if (count < 10000) return "bg-primary/60";
    return "bg-primary/80";
}
