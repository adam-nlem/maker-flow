import { PieChart, Pie } from "recharts"

interface DonutChartItem {
    label: string
    value: number
    color: string
}

interface DonutChartProps {
    data: DonutChartItem[]
    size?: number
    centerLabel?: string
    centerSubLabel?: string
}

export default function DonutChart({
    data,
    size = 120,
    centerLabel,
    centerSubLabel,
}: DonutChartProps) {
    const half = size / 2
    const innerRadius = half * 0.55
    const outerRadius = half * 0.9

    const chartData = data.map((item) => ({ ...item, fill: item.color }))

    return (
        <div className="relative **:outline-none" style={{ width: size, height: size }}>
            <PieChart width={size} height={size}>
                <Pie
                    data={chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    strokeWidth={0}
                    isAnimationActive={false}
                />
            </PieChart>
            {(centerLabel || centerSubLabel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {centerLabel && <span className="text-heading-sm">{centerLabel}</span>}
                    {centerSubLabel && <span className="text-body-xs text-gray">{centerSubLabel}</span>}
                </div>
            )}
        </div>
    )
}
