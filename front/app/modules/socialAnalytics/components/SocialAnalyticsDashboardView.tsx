import type { ModuleWidgetProps } from "~/modules/registry";
import { Button } from "~/components/ui/Button";
import { useAuthorizeInstagram } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { oAuthErrorCodeToFrenchTranslation } from "~/models/enums/OAuthErrorCode";

export default function SocialAnalyticsDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { authorize, isPending, integrationUuid, oauthError, reset } = useAuthorizeInstagram();

    const handleConnectInstagram = () => {
        reset();
        authorize();
    };

    if (integrationUuid) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center">
                    <h2 className="text-heading-lg text-primary mb-2">Instagram Connected</h2>
                    <p className="text-body-md text-secondary">
                        Your Instagram account has been successfully connected.
                    </p>
                </div>
            </div>
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
