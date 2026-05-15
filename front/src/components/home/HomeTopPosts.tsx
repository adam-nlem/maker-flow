import { useEffect } from "react";
import IntegrationPillRow from "~/components/integrations/IntegrationPillRow";
import RankedPostsList from "~/components/home/RankedPostsList";
import type { Integration } from "~/models/Integration";
import { useFocusIntegrationStore } from "~/stores/integrations/focusIntegrationStore";

interface HomeTopPostsProps {
    integrations: Integration[];
}

export default function HomeTopPosts({ integrations }: HomeTopPostsProps) {
    const focusedIntegrationUuid = useFocusIntegrationStore((state) => state.focusedIntegrationUuid);
    const setFocusedIntegrationUuid = useFocusIntegrationStore((state) => state.setFocusedIntegrationUuid);

    useEffect(() => {
        if (focusedIntegrationUuid === null && integrations.length > 0) {
            setFocusedIntegrationUuid(integrations[0].uuid);
        }
    }, [focusedIntegrationUuid, integrations, setFocusedIntegrationUuid]);

    if (integrations.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-body-xs text-muted-2 uppercase tracking-wider">Meilleurs posts du mois</h2>
            <IntegrationPillRow integrations={integrations} showAllOption={false} />
            {focusedIntegrationUuid && (
                <RankedPostsList integrationUuid={focusedIntegrationUuid} />
            )}
        </div>
    );
}
