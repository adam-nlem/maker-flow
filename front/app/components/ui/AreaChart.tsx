import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatToFrenchDateLong, formatToFrenchRelative } from "~/utils/dateFormatters";

interface AreaChartDataPoint {
    value: number;
    date: Date;
}

interface AreaChartProps {
    data: AreaChartDataPoint[];
    color: string;
    width?: string;
    height?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: AreaChartDataPoint }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const dataPoint = payload[0].payload;

    return (
        <div className="bg-white border border-light-gray rounded-md p-2 shadow-sm">
            <p className="text-heading-xs">{dataPoint.value.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-gray">{formatToFrenchDateLong(dataPoint.date)}</p>
        </div>
    );
}

export default function AreaChart({
    data,
    color,
    width = "w-24",
    height = "h-10",
}: AreaChartProps) {
    return (
        <div className={`${width} ${height}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart
                    data={data}
                    margin={{ top: 1, right: 0, left: 0, bottom: 0 }}
                >
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fill={color}
                        fillOpacity={0.25}
                        isAnimationActive={false}
                    />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
}
