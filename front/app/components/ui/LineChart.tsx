import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatDurationToFrench } from "~/utils/durationFormatters";

function formatHoursToFrench(hours: number): string {
    return formatDurationToFrench(Math.round(hours) * 3600, 2);
}

interface LineChartDataPoint {
    hoursAfterPublication: number;
    value: number;
    averageValue: number | null;
}

interface LineChartProps {
    data: LineChartDataPoint[];
    formatValue?: (v: number) => string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { value: number; dataKey: string; color: string }[];
    label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0 || label === undefined) {
        return null;
    }

    return (
        <div className="bg-white border border-light-gray rounded-md p-2 shadow-sm">
            <p className="text-body-xs text-gray mb-1">{formatHoursToFrench(label)}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
                    {entry.dataKey === "value" ? "Ce contenu" : "Moyenne (10 derniers)"}:{" "}
                    <span className="text-heading-xs">{entry.value?.toLocaleString("fr-FR") ?? "—"}</span>
                </p>
            ))}
        </div>
    );
}

export default function LineChart({ data, formatValue }: LineChartProps) {
    const tickFormatter = formatValue ?? ((v: number) => v.toLocaleString("fr-FR"));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                    data={data}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                    <XAxis
                        dataKey="hoursAfterPublication"
                        tickFormatter={formatHoursToFrench}
                        tick={{ fontSize: 12 }}
                        stroke="#D9D9D9"
                    />
                    <YAxis
                        tickFormatter={tickFormatter}
                        tick={{ fontSize: 12 }}
                        stroke="#D9D9D9"
                        width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value: string) =>
                            value === "value" ? "Ce contenu" : "Moyenne (10 derniers)"
                        }
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#43CEA9"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="averageValue"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}
