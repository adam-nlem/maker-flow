import { IntegrationStatus, integrationStatusToBgClass, integrationStatusToBorderClass, integrationStatusToFrenchTranslation, integrationStatusToTextClass } from "~/models/enums/IntegrationStatus"
import type { Integration } from "~/models/Integration"
import Pill from "../ui/Pill"
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";

interface IntegrationProfileInfoProps {
    projectUuid: string,
    integration: Integration
}

export default function IntegrationProfileInfo({ projectUuid, integration }: IntegrationProfileInfoProps) {
    const { createIntegration, isPending: isConnecting, oauthError } = useCreateIntegration({ projectUuid, platform: integration.platform });
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
            {integration.status !== IntegrationStatus.Active && <div className="flex flex-col gap-1">
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
