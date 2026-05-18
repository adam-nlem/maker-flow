import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Integration } from "~/models/Integration";
import { IntegrationStatus, integrationStatusToBgClass, integrationStatusToBorderClass, integrationStatusTranslationKeys, integrationStatusToTextClass } from "~/models/enums/IntegrationStatus";
import { type Platform, platformTranslationKeys, platformToIcon } from "~/models/enums/Platform";
import { oAuthErrorCodeTranslationKeys } from "~/models/enums/OAuthErrorCode";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { useRevokeIntegration } from "~/hooks/api/integrations/useRevokeIntegration";
import { Button } from "~/components/ui/Button";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { formatToRelative } from "~/utils/dateFormatters";
import Pill from "~/components/ui/Pill";

interface IntegrationLoginCardProps {
    projectUuid: string;
    platform: Platform;
    integration: Integration | null;
}

export default function IntegrationLoginCard({ projectUuid, platform, integration }: IntegrationLoginCardProps) {
    const { t } = useTranslation();
    const [isPendingRevoke, setIsPendingRevoke] = useState(false);

    const { createIntegration, isPending: isConnecting, oauthError } = useCreateIntegration({ projectUuid, platform });
    const { revokeIntegration, isPending: isRevoking } = useRevokeIntegration({ projectUuid });

    const handleConfirmRevoke = async () => {
        if (!integration) return;
        await revokeIntegration(integration.uuid);
        setIsPendingRevoke(false);
    };

    return (
        <div className="border border-pale-gray max-h-fit rounded-xl bg-clear p-5">
            {/* Header: platform name + status badge */}
            <div className="flex flex-row items-center justify-between gap-20 mb-4">
                <div className="flex flex-row items-center gap-3">
                    <img src={platformToIcon[platform]} className="size-6" alt={t(platformTranslationKeys[platform])} />
                    <h3 className="text-heading-md">{t(platformTranslationKeys[platform])}</h3>
                </div>
                {integration ? (
                    <Pill isSelected label={t(integrationStatusTranslationKeys[integration.status])} textColorClassName={integrationStatusToTextClass[integration.status]} bgColorClassName={integrationStatusToBgClass[integration.status]} borderColorClassName={integrationStatusToBorderClass[integration.status]} />
                ) : (
                    <Pill label={t("integrations:notConnected")} />

                )}
            </div>

            {/* Account info */}
            {integration ? (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row items-center gap-3">
                        {integration.profilePictureUrl && (
                            <img
                                src={integration.profilePictureUrl}
                                className="size-9 rounded-full object-cover shrink-0"
                                alt={integration.displayName}
                            />
                        )}
                        <div className="flex flex-col">
                            {integration.name && <p className="text-heading-sm">{integration.name}</p>}
                            <p className="text-body-sm text-muted-2">@{integration.userName}</p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <ArrowPathIcon className="size-4 text-muted-2 shrink-0" strokeWidth={1.5} />
                        <p className="text-body-xs text-muted-2">
                            {t("integrations:lastSync", { when: formatToRelative(integration.lastSyncedAt) })}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-body-sm text-muted-2">{t("integrations:noAccount")}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-5">
                <div className="flex flex-row items-center gap-3 justify-end">
                    {(!integration || integration.status !== IntegrationStatus.Active) ? (
                        <Button
                            style={integration ? "outline" : "primary"}
                            width="w-auto"
                            height="h-9"
                            isLoading={isConnecting}
                            disabled={isConnecting}
                            onClick={() => createIntegration()}
                        >
                            {integration ? t("integrations:reconnect") : t("integrations:connect")}
                        </Button>
                    ) : <Button
                        style="danger"
                        width="w-auto"
                        height="h-9"
                        disabled={isRevoking}
                        onClick={() => setIsPendingRevoke(true)}
                    >
                        {t("integrations:disconnect")}
                    </Button>}
                </div>
                {oauthError && (
                    <p className="text-body-xs text-danger text-right">
                        {t(oAuthErrorCodeTranslationKeys[oauthError])}
                    </p>
                )}
            </div>

            <ConfirmDeleteDialog
                isOpen={isPendingRevoke}
                onClose={() => setIsPendingRevoke(false)}
                onConfirm={handleConfirmRevoke}
                isPending={isRevoking}
                message={t("integrations:disconnectConfirm")}
            />
        </div>
    );
}
