import { type PostInsightType, postInsightTypeToIcon, formatPostInsightValue } from "~/models/enums/PostInsightType"

interface CompactMetricRowProps {
    metrics: { type: PostInsightType; value: number }[]
}

export default function CompactMetricRow({ metrics }: CompactMetricRowProps) {
    if (metrics.length === 0) return null

    return (
        <div className="flex flex-row items-center gap-2">
            {metrics.map((metric) => {
                const Icon = postInsightTypeToIcon[metric.type]
                return (
                    <div key={metric.type} className="flex flex-row items-center gap-1">
                        <Icon className="size-3 text-dark" />
                        <span className="text-heading-xs">{formatPostInsightValue(metric.type, metric.value)}</span>
                    </div>
                )
            })}
        </div>
    )
}
