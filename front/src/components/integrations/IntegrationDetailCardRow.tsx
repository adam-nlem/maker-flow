import { platformOptions } from "~/models/enums/Platform";
import type { IntegrationInsightsGroupedByIntegrationDTO } from "~/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO";
import IntegrationDetailCard from "./IntegrationDetailCard";

interface IntegrationDetailCardRowProps {
    groups: IntegrationInsightsGroupedByIntegrationDTO[];
    projectUuid: string | null;
}

export default function IntegrationDetailCardRow({ groups, projectUuid }: IntegrationDetailCardRowProps) {
    return (
        <div className="flex flex-row gap-3">
            {platformOptions.map((platform) => {
                const group = groups.find((g) => g.integration.platform === platform) ?? null;
                return (
                    <IntegrationDetailCard
                        key={platform}
                        platform={platform}
                        group={group}
                        projectUuid={projectUuid}
                    />
                );
            })}
        </div>
    );
}
