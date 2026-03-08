import { IntegrationStatus, integrationStatusToBgClass, integrationStatusToBorderClass, integrationStatusToFrenchTranslation, integrationStatusToTextClass } from "~/models/enums/IntegrationStatus"
import type { Integration } from "~/models/Integration"
import Pill from "../ui/Pill"
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";

interface IntegrationProfileInfoProps {
    integration: Integration
}

export default function IntegrationProfileInfo({ integration }: IntegrationProfileInfoProps) {
    const focusedProjectUuid = useFocusProjectStore((state) => state.focusedProjectUuid)

    const { createIntegration, isPending: isConnecting, oauthError } = useCreateIntegration({ projectUuid: focusedProjectUuid!, platform: integration.platform });
    return (
        <div className="flex flex-row gap-5 items-center">
            <div className="flex flex-row gap-1 items-center">
                {integration.profilePictureUrl && (
                    <img
                        src={integration.profilePictureUrl}
                        alt={integration.displayName}
                        className="size-10 rounded-full object-cover"
                    />
                )}
                <div className="flex flex-col">
                    <h1 className="text-heading-sm">{integration.name}</h1>
                    <p className="text-body-sm text-gray">{integration.userName}</p>
                </div>
            </div>
            {integration.status !== IntegrationStatus.Active && focusedProjectUuid && <div className="flex flex-col gap-1">
                <Pill isSelected
                    label={integrationStatusToFrenchTranslation[integration.status]}
                    textColorClassName={integrationStatusToTextClass[integration.status]}
                    bgColorClassName={integrationStatusToBgClass[integration.status]}
                    borderColorClassName={integrationStatusToBorderClass[integration.status]} />
                <Pill label="Se Connecter"
                    onClick={() => createIntegration()} />
            </div>}
        </div>
    )
}
