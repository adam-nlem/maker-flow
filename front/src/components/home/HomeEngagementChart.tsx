import HorizontalBarChart from "~/components/ui/HorizontalBarChart";
import type { DashboardPlatformDetailDTO } from "~/dtos/dashboard/DashboardPlatformDetailDTO";
import { platformToChartColor, platformToFrenchTranslation } from "~/models/enums/Platform";

interface HomeEngagementChartProps {
    platformDetails: DashboardPlatformDetailDTO[];
}

export default function HomeEngagementChart({ platformDetails }: HomeEngagementChartProps) {
    const data = platformDetails
        .filter((d) => d.engagementRate !== null)
        .map((d) => ({
            label: platformToFrenchTranslation[d.platform],
            value: d.engagementRate!,
            color: platformToChartColor[d.platform],
        }));

    if (data.length === 0) return null;

    return (
        <div className="border border-light-gray rounded-lg p-4">
            <h2 className="text-body-sm mb-3">Engagement par plateforme</h2>
            <HorizontalBarChart data={data} />
        </div>
    );
}
