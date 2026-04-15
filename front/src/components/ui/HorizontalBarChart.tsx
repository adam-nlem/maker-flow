import { Bar, BarChart, Rectangle, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { BarShapeProps } from "recharts";

interface HorizontalBarChartItem {
    label: string;
    value: number;
    color: string;
}

interface HorizontalBarChartProps {
    data: HorizontalBarChartItem[];
}

function CustomBar(props: BarShapeProps) {
    const color = (props.payload as HorizontalBarChartItem).color;
    return (
        <Rectangle
            {...props}
            fill={`color-mix(in srgb, ${color} 10%, transparent)`}
            stroke={`color-mix(in srgb, ${color} 30%, transparent)`}
            strokeWidth={1}
        />
    );
}

export default function HorizontalBarChart({ data }: HorizontalBarChartProps) {
    if (data.length === 0) return null;

    return (
        <div className="w-full h-30 **:outline-none">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis
                        type="number"
                        tickFormatter={(v: number) => `${v}%`}
                        tick={{ fontSize: 12 }}
                        stroke="var(--color-gray)"
                    />
                    <YAxis
                        type="category"
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        width={80}
                        stroke="var(--color-gray)"
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={true} shape={CustomBar} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
