import { LinkIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { Platform } from "~/models/enums/Platform";
import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";

export default function ConnectIntegrationPlaceholder() {
    const setSelectedPlatform = useIntegrationLoginModalStore((state) => state.setSelectedPlatform);

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <LinkIcon className="size-6 text-gray mb-2" />
            <h2 className="text-heading-md mb-1">Aucune intégration connectée</h2>
            <p className="text-body-sm text-gray mb-3 text-center max-w-xs">
                Connectez un compte Instagram ou YouTube pour accéder à vos statistiques.
            </p>
            <Button style="primary" width="w-fit" onClick={() => setSelectedPlatform(Platform.Instagram)}>
                Connecter un compte
            </Button>
        </div>
    );
}
