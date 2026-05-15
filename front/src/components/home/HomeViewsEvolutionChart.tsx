import { useTranslation } from "react-i18next";
import MultiLineChart from "~/components/ui/MultiLineChart";
import type { IntegrationInsightsViewsTimelineDTO } from "~/dtos/integrationInsights/IntegrationInsightsViewsTimelineDTO";
import { platformOptions, platformToChartColor, platformTranslationKeys } from "~/models/enums/Platform";

interface HomeViewsEvolutionChartProps {
    viewsTimeline: IntegrationInsightsViewsTimelineDTO[];
}

export default function HomeViewsEvolutionChart({ viewsTimeline }: HomeViewsEvolutionChartProps) {
    const { t } = useTranslation();

    if (viewsTimeline.length === 0) return null;

    const series = viewsTimeline
        .filter((timeline) => platformOptions.includes(timeline.platform))
        .map((timeline) => ({
            label: t(platformTranslationKeys[timeline.platform]),
            color: platformToChartColor[timeline.platform],
            data: timeline.points.map((p) => ({ date: p.date, value: p.value })),
        }));

    return (
        <div className="border border-pale-gray rounded-lg p-3">
            <h2 className="text-heading-sm mb-3">{t("home:viewsEvolution.title")}</h2>
            <MultiLineChart series={series} />
        </div>
    );
}
