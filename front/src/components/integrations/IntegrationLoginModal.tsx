import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import IntegrationLoginCard from "./IntegrationLoginCard";
import ModalOverlay from "../ui/ModalOverlay";

export default function IntegrationLoginModal() {
    const projectUuid = useIntegrationLoginModalStore((state) => state.projectUuid);
    const selectedPlatform = useIntegrationLoginModalStore((state) => state.selectedPlatform);
    const close = useIntegrationLoginModalStore((state) => state.close);

    const { integrations } = useListIntegrations({ projectUuid });

    if (!selectedPlatform || !projectUuid) return null;

    return (
        <ModalOverlay isOpen onClose={close} height="max-h-fit">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <IntegrationLoginCard
                    projectUuid={projectUuid}
                    platform={selectedPlatform}
                    integration={integrations.find((i) => i.platform === selectedPlatform) ?? null}
                />
            </div>
        </ModalOverlay>
    );
}
