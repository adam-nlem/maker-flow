import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import IntegrationLoginCard from "./IntegrationLoginCard";
import ModalOverlay from "../ui/ModalOverlay";

export default function IntegrationLoginModal() {
    const selectedPlatform = useIntegrationLoginModalStore((state) => state.selectedPlatform);
    const setSelectedPlatform = useIntegrationLoginModalStore((state) => state.setSelectedPlatform);
    const focusedProjectUuid = useFocusProjectStore((state) => state.focusedProjectUuid);

    const { integrations } = useListIntegrations({ projectUuid: focusedProjectUuid });

    if (!selectedPlatform || !focusedProjectUuid) return null;

    return (
        <ModalOverlay isOpen onClose={() => setSelectedPlatform(null)}>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <IntegrationLoginCard
                    projectUuid={focusedProjectUuid}
                    platform={selectedPlatform}
                    integration={integrations.find((i) => i.platform === selectedPlatform) ?? null}
                />
            </div>
        </ModalOverlay>
    );
}
