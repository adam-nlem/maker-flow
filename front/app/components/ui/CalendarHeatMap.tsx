import type { ChartDataPoint } from "~/utils/chartDataHelpers";


interface CalendarHeatMapProps {
    data: ChartDataPoint[];
    weeks?: number; // default: 52
}

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

export function CalendarHeatMap({
    data,
    weeks = 52,
}: CalendarHeatMapProps) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - weeks * 7);

    // Normalize data into a map for O(1) access
    const dataMap = new Map(
        data.map((d) => [dayKey(d.date), d.value])
    );

    const days: { date: Date | null; value: number }[] = [];

    for (
        let d = new Date(startDate);
        d <= today;
        d.setDate(d.getDate() + 1)
    ) {
        const key = dayKey(d);
        days.push({
            date: new Date(d),
            value: dataMap.get(key) ?? 0,
        });
    }

    // Pad start so weeks align (Sunday first)
    const firstDay = days[0].date!.getDay(); // 0 = Sunday
    for (let i = 0; i < firstDay; i++) {
        days.unshift({
            date: null,
            value: 0,
        });
    }

    const weeksGrid: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeksGrid.push(days.slice(i, i + 7));
    }

    return (
        <div className="flex gap-1">
            {weeksGrid.map((week, i) => (
                <div key={i} className="flex flex-col gap-1">
                    {week.map((day, j) => (
                        <div
                            key={j}
                            title={
                                day.date
                                    ? `${dayKey(day.date)} – ${day.value}`
                                    : ""
                            }
                            className={`h-3 w-3 rounded-sm ${getColor(day.value)}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function getColor(count: number) {
    if (count === 0) return "bg-zinc-200 dark:bg-zinc-800";
    if (count < 1000) return "bg-emerald-200";
    if (count < 5000) return "bg-emerald-400";
    if (count < 10000) return "bg-emerald-600";
    return "bg-emerald-800";
}