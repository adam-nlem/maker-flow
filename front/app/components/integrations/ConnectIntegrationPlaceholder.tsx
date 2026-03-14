import { useNavigate } from "react-router";
import { LinkIcon } from "@heroicons/react/24/outline";
import { settingsIntegrationsPath } from "~/routes/routePaths";
import { Button } from "~/components/ui/Button";

export default function ConnectIntegrationPlaceholder() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <LinkIcon className="size-6 text-gray mb-2" />
            <h2 className="text-heading-md mb-1">Aucune intégration connectée</h2>
            <p className="text-body-sm text-gray mb-3 text-center max-w-xs">
                Connectez un compte Instagram ou YouTube pour accéder à vos statistiques.
            </p>
            <Button style="primary" width="w-fit" onClick={() => navigate(settingsIntegrationsPath)}>
                Connecter un compte
            </Button>
        </div>
    );
}
