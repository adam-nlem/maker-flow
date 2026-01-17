import type { ModuleWidgetProps } from "~/modules/registry";
import { Button } from "~/components/ui/Button";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { oAuthErrorCodeToFrenchTranslation } from "~/models/enums/OAuthErrorCode";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { IntegrationProvider } from "~/models/enums/IntegrationProvider";
import SocialAnalyticsDashboardContent from "./SocialAnalyticsDashboardContent";

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
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
                <h2 className="text-heading-lg text-primary mb-2">Social Analytics</h2>
                <p className="text-body-md text-secondary">
                    Connect your Instagram account to start tracking your analytics
                </p>
            </div>
            {oauthError && (
                <p className="text-body-sm text-danger">{oAuthErrorCodeToFrenchTranslation[oauthError]}</p>
            )}
            <Button
                style="primary"
                width="w-auto"
                onClick={handleConnectInstagram}
                isLoading={isPending}
            >
                Connect Instagram
            </Button>
        </div>
    );
}
