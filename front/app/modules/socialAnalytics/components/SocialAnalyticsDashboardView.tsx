import type { ModuleWidgetProps } from "~/modules/registry";
import { Button } from "~/components/ui/Button";
import { useInstagramAuthorize } from "~/hooks/api/integrations/useInstagramAuthorize";

export default function SocialAnalyticsDashboardView({ userModuleUuid }: ModuleWidgetProps) {
    const { authorize, isLoading } = useInstagramAuthorize();

    const handleConnectInstagram = () => {
        authorize();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
                <h2 className="text-heading-lg text-primary mb-2">Social Analytics</h2>
                <p className="text-body-md text-secondary">
                    Connect your Instagram account to start tracking your analytics
                </p>
            </div>
            <Button
                style="primary"
                width="w-auto"
                onClick={handleConnectInstagram}
                isLoading={isLoading}
            >
                Connect Instagram
            </Button>
        </div>
    );
}
