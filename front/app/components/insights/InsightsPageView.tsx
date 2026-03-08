import IntegrationPillRow from "~/components/integrations/IntegrationPillRow";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { useFocusIntegrationStore } from "~/stores/integrations/focusIntegrationStore";
import IntegrationPageView from "./integrations/IntegrationPageView";

export default function InsightsPageView({ projectUuid }: { projectUuid: string }) {
    const { integrations, isLoading } = useListIntegrations({ projectUuid });

    const focusedIntegrationUuid = useFocusIntegrationStore((state) => state.focusedIntegrationUuid)

    const focusedIntegration = integrations.find((integration) => integration.uuid === focusedIntegrationUuid);
    const displayedIntegration = focusedIntegration ?? integrations[0];

    if (isLoading) {
        return null;
    }

    return <div className="p-5 flex flex-col gap-3 h-screen overflow-hidden">
        <IntegrationPillRow integrations={integrations} />

        <IntegrationPageView integration={displayedIntegration} />
    </div >;
}
