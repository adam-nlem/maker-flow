import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { Integration } from "~/models/Integration";
import { IntegrationStatus, integrationStatusToBgClass, integrationStatusToBorderClass, integrationStatusToFrenchTranslation, integrationStatusToTextClass } from "~/models/enums/IntegrationStatus";
import { type Platform, platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform";
import { oAuthErrorCodeToFrenchTranslation } from "~/models/enums/OAuthErrorCode";
import { useCreateIntegration } from "~/hooks/api/integrations/useAuthorizeInstagram";
import { useRevokeIntegration } from "~/hooks/api/integrations/useRevokeIntegration";
import { Button } from "~/components/ui/Button";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import Pill from "~/components/ui/Pill";

interface IntegrationLoginCardProps {
    projectUuid: string;
    platform: Platform;
    integration: Integration | null;
}

export default function IntegrationLoginCard({ projectUuid, platform, integration }: IntegrationLoginCardProps) {
    const [isPendingRevoke, setIsPendingRevoke] = useState(false);

    const { createIntegration, isPending: isConnecting, oauthError } = useCreateIntegration({ projectUuid, platform });
    const { revokeIntegration, isPending: isRevoking } = useRevokeIntegration({ projectUuid });

    const handleConfirmRevoke = async () => {
        if (!integration) return;
        await revokeIntegration(integration.uuid);
        setIsPendingRevoke(false);
    };

    return (
        <div className="border border-light-gray max-h-fit rounded-xl p-5">
            {/* Header: platform name + status badge */}
            <div className="flex flex-row items-center justify-between gap-20 mb-4">
                <div className="flex flex-row items-center gap-3">
                    <img src={platformToIcon[platform]} className="size-6" alt={platformToFrenchTranslation[platform]} />
                    <h3 className="text-heading-md">{platformToFrenchTranslation[platform]}</h3>
                </div>
                {integration ? (
                    <Pill isSelected label={integrationStatusToFrenchTranslation[integration.status]} textColorClassName={integrationStatusToTextClass[integration.status]} bgColorClassName={integrationStatusToBgClass[integration.status]} borderColorClassName={integrationStatusToBorderClass[integration.status]} />
                ) : (
                    <Pill label="Non connecté" />

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
                            <p className="text-body-sm text-gray">@{integration.userName}</p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <ArrowPathIcon className="size-4 text-gray shrink-0" strokeWidth={1.5} />
                        <p className="text-body-xs text-gray">
                            Dernière synchro : {formatToFrenchRelative(integration.lastSyncedAt)}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-body-sm text-gray">Aucun compte connecté.</p>
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
                            {integration ? 'Reconnecter' : 'Connecter'}
                        </Button>
                    ) : <Button
                        style="danger"
                        width="w-auto"
                        height="h-9"
                        disabled={isRevoking}
                        onClick={() => setIsPendingRevoke(true)}
                    >
                        Déconnecter
                    </Button>}
                </div>
                {oauthError && (
                    <p className="text-body-xs text-danger text-right">
                        {oAuthErrorCodeToFrenchTranslation[oauthError]}
                    </p>
                )}
            </div>

            <ConfirmDeleteDialog
                isOpen={isPendingRevoke}
                onClose={() => setIsPendingRevoke(false)}
                onConfirm={handleConfirmRevoke}
                isPending={isRevoking}
                message="Êtes-vous sûr de vouloir déconnecter ce compte ? Cette action est irréversible."
            />
        </div>
    );
}
