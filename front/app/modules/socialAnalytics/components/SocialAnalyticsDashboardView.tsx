import type { ModuleWidgetProps } from "~/modules/registry";
import { Button } from "~/components/ui/Button";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { oAuthErrorCodeToFrenchTranslation } from "~/models/enums/OAuthErrorCode";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { IntegrationProvider, integrationProviderTypeOptions } from "~/models/enums/IntegrationProvider";
import SocialAnalyticsDashboardContent from "./SocialAnalyticsDashboardContent";
import Shimmer from "~/components/ui/Shimmer";
import CreateSocialAnalyticsIntegrationCard from "./integrations/CreateSocialAnalyticsIntegrationCard";


export default function SocialAnalyticsDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { integrations, isLoading } = useListIntegrations({ userModuleUuid });
    const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
        userModuleUuid,
        provider: IntegrationProvider.Instagram,
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
            <SocialAnalyticsDashboardContent
                userModuleUuid={userModuleUuid}
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
                {integrationProviderTypeOptions.map((integrationProviderType) => (
                    <CreateSocialAnalyticsIntegrationCard
                        key={integrationProviderType}
                        userModuleUuid={userModuleUuid}
                        provider={integrationProviderType}
                    />
                ))}
            </div>
            {oauthError && (
                <p className="text-body-sm text-danger">{oAuthErrorCodeToFrenchTranslation[oauthError]}</p>
            )}
        </div>
    );
}
