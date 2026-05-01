import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();

    if (!active || !payload || payload.length === 0 || label === undefined) {
        return null;
    }

    return (
        <div className="bg-clear border border-light-gray rounded-md p-2 shadow-sm flex flex-col gap-1">
            <p className="text-body-xs text-gray mb-1">{t("lineChart.durationAfterPublication", { duration: formatHoursToFrench(label) })}</p>
            {payload.map((entry) => (
                <div className="flex flex-row gap-1">
                    <div className={`rounded-full p-1 ${entry.dataKey === "value" ? 'bg-primary' : 'bg-light-gray'}`}></div>
                    <p key={entry.dataKey} className="text-xs">
                        {entry.dataKey === "value" ? t("lineChart.thisContentValue") : t("lineChart.averageContentValue")}:{" "}
                        <span className="text-heading-xs">{entry.value?.toLocaleString("fr-FR") ?? "—"}</span>
                    </p>
                </div>
            ))}
        </div>
    );
}

export default function LineChart({ data, formatValue }: LineChartProps) {
    const tickFormatter = formatValue ?? ((v: number) => v.toLocaleString("fr-FR"));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hoursAfterPublication"
                        tickFormatter={formatHoursToFrench}
                        tick={{ fontSize: 12 }}
                        interval="preserveEnd"
                        minTickGap={30} // Ensures at least 30px between labels
                        stroke="var(--color-light-gray)" />
                    <YAxis width="auto" tickFormatter={tickFormatter}
                        tick={{ fontSize: 12 }}
                        tickCount={5}
                        domain={['dataMin', 'auto']} // Ensure the axis starts at the minimum data value (or averageValue)
                        allowDecimals={false}

                        stroke="var(--color-light-gray)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="averageValue"
                        stroke="var(--color-gray-400)"
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
