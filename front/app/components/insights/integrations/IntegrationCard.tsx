import type { Integration } from "~/models/Integration"
import type { IntegrationInsight } from "~/models/IntegrationInsight"
import { IntegrationInsightType, integrationInsightTypeToFrenchTranslation } from "~/models/enums/IntegrationInsightType"
import { platformToIcon } from "~/models/enums/Platform"
import IntegrationProfileInfo from "~/components/integrations/IntegrationProfileInfo"

interface IntegrationCardProps {
    integration: Integration
    insights: IntegrationInsight[]
    insightType: IntegrationInsightType
    onClick?: () => void
}

export default function IntegrationCard({
    integration,
    insights,
    insightType,
    onClick,
}: IntegrationCardProps) {
    return (
        <div
            className="border bg-clear border-light-gray rounded-lg p-2 flex flex-col gap-3 w-full cursor-pointer"
            onClick={onClick}
        >
            <div className="flex flex-row gap-10 justify-between">
                <IntegrationProfileInfo integration={integration} />

                <img
                    src={platformToIcon[integration.platform]}
                    alt={integration.platform}
                    className="ml-20 size-7 rounded-md object-cover"
                />
            </div>
            <div className="border-t border-light-gray rounded w-full"></div>

            <div>
                <h1 className="text-heading-sm">{insights.find((insight) => insight.type === insightType)?.value}</h1>
                <p className="text-body-sm text-gray whitespace-nowrap">
                    {integrationInsightTypeToFrenchTranslation[insightType]}
                </p>
            </div>
        </div>
    )
}
