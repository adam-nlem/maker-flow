import { useShowIntegrationProviderIcon } from "~/hooks/api/integrations/useShowIntegrationProviderIcon";
import type { IntegrationProvider } from "~/models/enums/IntegrationProvider";
import Shimmer from "~/components/ui/Shimmer";
import { Button } from "~/components/ui/Button";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";

interface CreateIntegrationTileProps {
    userModuleUuid: string;
    provider: IntegrationProvider;
}

export default function CreateIntegrationTile({ userModuleUuid, provider }: CreateIntegrationTileProps) {
    const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
        userModuleUuid,
        provider: provider,
    });

    const { iconUrl } = useShowIntegrationProviderIcon(provider);

    return (
        <div className="border bg-clear border-light-gray rounded-lg p-2 flex flex-col justify-between w-full">
            <div className="flex flex-row gap-10 justify-between">
                <div className="flex flex-row gap-1 items-center">
                    <Shimmer width="w-10" height="h-10" radius="rounded-full" />

                    <div className="flex flex-col gap-1">
                        <Shimmer width="w-15" />
                        <Shimmer width="w-25" />
                    </div>
                </div>

                {iconUrl && (
                    <img
                        src={iconUrl}
                        alt={provider}
                        className="size-7"
                    />
                )}
            </div>
            <div className="border-t border-light-gray rounded w-full"></div>
            <Button style="secondary" width="w-full" height="h-7" onClick={() => {
                reset();
                createIntegration();
            }}>
                Se connecter
            </Button>
        </div>
    );
}
