import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCompactNumber } from "~/utils/numberFormatters";

interface MultiLineChartSeries {
    label: string;
    color: string;
    data: { date: string; value: number }[];
}

interface MultiLineChartProps {
    series: MultiLineChartSeries[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { value: number; dataKey: string; color: string }[];
    label?: string;
}

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0 || !label) {
        return null;
    }

    return (
        <div className="bg-clear border border-light-gray rounded-md p-2 shadow-sm flex flex-col gap-1">
            <p className="text-body-xs text-gray mb-1">{formatDateLabel(label)}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex flex-row items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <p className="text-body-xs">
                        {entry.dataKey}: <span className="text-heading-xs">{formatCompactNumber(entry.value)}</span>
                    </p>
                </div>
            ))}
        </div>
    );
}

export default function MultiLineChart({ series }: MultiLineChartProps) {
    if (series.length === 0) return null;

    const allDates = new Set<string>();
    for (const s of series) {
        for (const d of s.data) {
            allDates.add(d.date);
        }
    }

    const sortedDates = Array.from(allDates).sort();

    const dataByDate = new Map<string, Record<string, number>>();
    for (const s of series) {
        for (const d of s.data) {
            const existing = dataByDate.get(d.date) ?? {};
            existing[s.label] = d.value;
            dataByDate.set(d.date, existing);
        }
    }

    const mergedData = sortedDates.map((date) => ({
        date,
        ...dataByDate.get(date),
    }));

    return (
        <div className="w-full h-50 **:outline-none">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-light-gray)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDateLabel}
                        tick={{ fontSize: 12 }}
                        interval="preserveEnd"
                        minTickGap={40}
                        stroke="var(--color-gray)"
                    />
                    <YAxis
                        tickFormatter={(v: number) => formatCompactNumber(v)}
                        tick={{ fontSize: 12 }}
                        tickCount={5}
                        allowDecimals={false}
                        stroke="var(--color-gray)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {series.map(({ label, color }) => (
                        <Line
                            key={label}
                            type="monotone"
                            dataKey={label}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
