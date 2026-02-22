import { Button } from "~/components/ui/Button";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { oAuthErrorCodeToFrenchTranslation } from "~/models/enums/OAuthErrorCode";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { Platform, platformOptions } from "~/models/enums/Platform";
import InsightsDashboardContent from "./InsightsDashboardContent";
import Shimmer from "~/components/ui/Shimmer";
import CreateIntegrationCard from "./integrations/CreateIntegrationCard";


export default function InsightsDashboardView({ projectUuid }: { projectUuid: string }) {
    const { integrations, isLoading } = useListIntegrations({ projectUuid });
    const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
        projectUuid,
        platform: Platform.Instagram,
    });

    const handleConnectInstagram = () => {
        reset();
        createIntegration();
    };

    if (isLoading) {
        return null;
    }

    if (integrations.length > 0 || integrationUuid) {
        return (
            <InsightsDashboardContent
                projectUuid={projectUuid}
                integrations={integrations}
            />
        );
    }

    

    return (
        <div className="p-5 w-2/3 h-[50vh] flex flex-col gap-3">
            <div className="border border-light-gray rounded-xl bg-primary/30 text-center py-5">
                <h1 className="text-heading-lg">Connectez-vous à vos réseaux sociaux</h1>
                <p className="text-body-sm">Liez vos comptes afin d'acceder à vos statistiques</p>
            </div>

            <div className="flex flex-row justify-between gap-3">
                {platformOptions.map((platform) => (
                    <CreateIntegrationCard
                        key={platform}
                        projectUuid={projectUuid}
                        platform={platform}
                    />
                ))}
            </div>
            {oauthError && (
                <p className="text-body-sm text-danger">{oAuthErrorCodeToFrenchTranslation[oauthError]}</p>
            )}
        </div>
    );
}
