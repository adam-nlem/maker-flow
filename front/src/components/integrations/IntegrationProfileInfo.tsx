import { IntegrationStatus, integrationStatusToBgClass, integrationStatusToBorderClass, integrationStatusToFrenchTranslation, integrationStatusToTextClass } from "~/models/enums/IntegrationStatus"
import type { Integration } from "~/models/Integration"
import { platformToIcon } from "~/models/enums/Platform"
import { UserIcon } from "@heroicons/react/24/solid"
import Pill from "../ui/Pill"
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";

interface IntegrationProfileInfoProps {
    integration: Integration
}

export default function IntegrationProfileInfo({ integration }: IntegrationProfileInfoProps) {
    const focusedProjectUuid = useFocusProjectStore((state) => state.focusedProjectUuid)

    const { createIntegration } = useCreateIntegration({ projectUuid: focusedProjectUuid!, platform: integration.platform });
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-1 items-center">
                    {integration.profilePictureUrl ? (
                        <img
                            src={integration.profilePictureUrl}
                            alt={integration.displayName}
                            className="size-7 rounded-full object-cover"
                        />
                    ) : (
                        <div className="size-7 rounded-full bg-light-gray flex items-center justify-center">
                            <UserIcon className="size-4 text-gray" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-heading-xs">{integration.name}</h1>
                        <p className="text-body-xs text-gray">{integration.userName}</p>
                    </div>
                </div>
                <img
                    src={platformToIcon[integration.platform]}
                    alt={platformToIcon[integration.platform]}
                    className="size-3.5"
                />
            </div>
            {integration.status !== IntegrationStatus.Active && focusedProjectUuid && <div className="flex flex-row gap-1">
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
