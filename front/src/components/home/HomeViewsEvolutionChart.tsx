import MultiLineChart from "~/components/ui/MultiLineChart";
import type { IntegrationInsightsViewsTimelineDTO } from "~/dtos/integrationInsights/IntegrationInsightsViewsTimelineDTO";
import { platformOptions, platformToChartColor, platformToFrenchTranslation } from "~/models/enums/Platform";

interface HomeViewsEvolutionChartProps {
    viewsTimeline: IntegrationInsightsViewsTimelineDTO[];
}

export default function HomeViewsEvolutionChart({ viewsTimeline }: HomeViewsEvolutionChartProps) {
    if (viewsTimeline.length === 0) return null;

    const series = viewsTimeline
        .filter((t) => platformOptions.includes(t.platform))
        .map((t) => ({
            label: platformToFrenchTranslation[t.platform],
            color: platformToChartColor[t.platform],
            data: t.points.map((p) => ({ date: p.date, value: p.value })),
        }));

    return (
        <div className="border border-light-gray rounded-lg p-3">
            <h2 className="text-heading-sm mb-3">Évolution des vues</h2>
            <MultiLineChart series={series} />
        </div>
    );
}
