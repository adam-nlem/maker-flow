import IntegrationPillRow from "~/components/integrations/IntegrationPillRow";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { useFocusIntegrationStore } from "~/stores/integrations/focusIntegrationStore";
import IntegrationPageView from "./integrations/IntegrationPageView";
import PremiumOverlay from "~/components/ui/PremiumOverlay";
import { useIsSubscribed } from "~/hooks/useIsSubscribed";

export default function InsightsPageView({ projectUuid }: { projectUuid: string }) {
    const { integrations, isLoading } = useListIntegrations({ projectUuid });
    const { isSubscribed } = useIsSubscribed();

    const focusedIntegrationUuid = useFocusIntegrationStore((state) => state.focusedIntegrationUuid)

    const focusedIntegration = integrations.find((integration) => integration.uuid === focusedIntegrationUuid);
    const displayedIntegration = focusedIntegration ?? integrations[0];
    const isAggregatedView = focusedIntegrationUuid === null;

    if (isLoading) {
        return null;
    }

    if (isAggregatedView && !isSubscribed) {
        return <div className="p-5 flex flex-col gap-3 h-screen overflow-hidden">
            <IntegrationPillRow integrations={integrations} />
            <PremiumOverlay isRestricted>
                <div className="h-96" />
            </PremiumOverlay>
        </div>;
    }

    return <div className="p-5 flex flex-col gap-3 h-screen overflow-hidden">
        <IntegrationPillRow integrations={integrations} />

        <IntegrationPageView integration={displayedIntegration} />
    </div >;
}
