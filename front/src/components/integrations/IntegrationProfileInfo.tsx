import { useTranslation } from "react-i18next"
import { UserIcon } from "@heroicons/react/24/solid"
import { IntegrationStatus, integrationStatusToBgClass, integrationStatusToBorderClass, integrationStatusTranslationKeys, integrationStatusToTextClass } from "~/models/enums/IntegrationStatus"
import { Platform, platformToIcon, platformTranslationKeys } from "~/models/enums/Platform"
import type { Integration } from "~/models/Integration"
import Pill from "../ui/Pill"
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";

interface IntegrationProfileInfoProps {
    integration: Integration | null
    platform: Platform
}

export default function IntegrationProfileInfo({ integration, platform }: IntegrationProfileInfoProps) {
    const { t } = useTranslation()
    const focusedProjectUuid = useFocusProjectStore((state) => state.focusedProjectUuid)
    const { createIntegration } = useCreateIntegration({ projectUuid: focusedProjectUuid!, platform: integration?.platform ?? platform });

    const displayedPlatform = integration?.platform ?? platform
    const title = integration?.name ?? t(platformTranslationKeys[platform])
    const subtitle = integration?.userName ?? t("integrations:notConnected")

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-1 items-center">
                    {integration?.profilePictureUrl ? (
                        <img
                            src={integration.profilePictureUrl}
                            alt={integration.displayName}
                            className="size-7 rounded-full object-cover"
                        />
                    ) : (
                        <div className="size-7 rounded-full bg-pale-gray-2 flex items-center justify-center">
                            <UserIcon className="size-4 text-muted-2" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-heading-xs">{title}</h1>
                        <p className="text-body-xs text-muted-2">{subtitle}</p>
                    </div>
                </div>
                <img
                    src={platformToIcon[displayedPlatform]}
                    alt={platformToIcon[displayedPlatform]}
                    className="size-3.5"
                />
            </div>
            {integration && integration.status !== IntegrationStatus.Active && focusedProjectUuid && <div className="flex flex-row gap-1">
                <Pill isSelected
                    label={t(integrationStatusTranslationKeys[integration.status])}
                    textColorClassName={integrationStatusToTextClass[integration.status]}
                    bgColorClassName={integrationStatusToBgClass[integration.status]}
                    borderColorClassName={integrationStatusToBorderClass[integration.status]} />
                <Pill label={t("integrations:loginAction")}
                    onClick={() => createIntegration()} />
            </div>}
        </div>
    )
}
