import { RectangleStackIcon } from "@heroicons/react/24/outline"
import { ChatBubbleLeftIcon, EyeIcon, HeartIcon, UsersIcon } from "@heroicons/react/24/solid"
import IntegrationProfileInfo from "~/components/integrations/IntegrationProfileInfo"
import Pill from "~/components/ui/Pill"
import InsightTile from "~/components/insights/InsightTile"
import { useListIntegrationInsights } from "~/hooks/api/integrationInsights/useListIntegrationInsights"
import { useHomeFilterStore } from "~/stores/homeFilterStore"
import { platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform"
import { IntegrationInsightType, integrationInsightTypeToFrenchTranslation } from "~/models/enums/IntegrationInsightType"

interface HomeInsightsOverviewProps {
    projectUuid: string
}

export default function HomeInsightsOverview({ projectUuid }: HomeInsightsOverviewProps) {
    const focusedIntegrationUuid = useHomeFilterStore((state) => state.focusedIntegrationUuid)
    const setFocusedIntegrationUuid = useHomeFilterStore((state) => state.setFocusedIntegrationUuid)
    const { insightsOverview } = useListIntegrationInsights({ projectUuid })

    if (!insightsOverview) return null

    const focusedGroup = insightsOverview.groups.find((g) => g.integration.uuid === focusedIntegrationUuid)
    const displayedInsights: { type: IntegrationInsightType; value: number }[] = focusedGroup
        ? focusedGroup.insights.map((i) => ({ type: i.type, value: i.value }))
        : insightsOverview.aggregatedInsights

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row flex-wrap gap-3">
                {insightsOverview.groups.map((group) => (
                    <Pill
                        key={group.integration.uuid}
                        imageUrl={platformToIcon[group.integration.platform]}
                        label={platformToFrenchTranslation[group.integration.platform]}
                        isSelected={group.integration.uuid === focusedIntegrationUuid}
                        onClick={() => setFocusedIntegrationUuid(group.integration.uuid)}
                        borderColorClassName="border-light-gray"
                    />
                ))}
                <Pill
                    icon={RectangleStackIcon}
                    label="Toutes les plateformes"
                    isSelected={focusedIntegrationUuid === null}
                    onClick={() => setFocusedIntegrationUuid(null)}
                    borderColorClassName="border-light-gray"
                />
            </div>

            {focusedGroup && (
                <IntegrationProfileInfo integration={focusedGroup.integration} />
            )}

            <div className="flex flex-row flex-wrap gap-3">
                <InsightTile
                    label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.TotalFollowers]}
                    value={displayedInsights.find((i) => i.type === IntegrationInsightType.TotalFollowers)?.value ?? 0}
                    Icon={UsersIcon}
                />
                <InsightTile
                    label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.Views]}
                    value={displayedInsights.find((i) => i.type === IntegrationInsightType.Views)?.value ?? 0}
                    Icon={EyeIcon}
                />
                <InsightTile
                    label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.Likes]}
                    value={displayedInsights.find((i) => i.type === IntegrationInsightType.Likes)?.value ?? 0}
                    Icon={HeartIcon}
                />
                <InsightTile
                    label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.Comments]}
                    value={displayedInsights.find((i) => i.type === IntegrationInsightType.Comments)?.value ?? 0}
                    Icon={ChatBubbleLeftIcon}
                />
            </div>
        </div>
    )
}
