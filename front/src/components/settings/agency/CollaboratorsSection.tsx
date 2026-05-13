import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import Shimmer from "~/components/ui/Shimmer";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListCollaborators } from "~/hooks/api/collaborators/useListCollaborators";
import { useCollaboratorModalsStore } from "~/stores/collaborators/collaboratorModalsStore";
import CollaboratorsTable, { type CollaboratorRow } from "./CollaboratorsTable";

export default function CollaboratorsSection() {
    const { t } = useTranslation();
    const { user: currentUser } = useCurrentUser();
    const { agencyCollaborators, isLoading } = useListCollaborators();

    const setIsInviteOpen = useCollaboratorModalsStore((s) => s.setIsInviteOpen);
    const setRemovingUserUuid = useCollaboratorModalsStore((s) => s.setRemovingUserUuid);
    const openDeleteInvitation = useCollaboratorModalsStore((s) => s.openDeleteInvitation);

    const collaborators = agencyCollaborators?.collaborators ?? [];
    const pendingInvitations = agencyCollaborators?.pendingInvitations ?? [];

    const rows: CollaboratorRow[] = [
        ...collaborators.map((collaborator): CollaboratorRow => {
            const isSelf = collaborator.uuid === currentUser?.uuid;
            return {
                key: `user-${collaborator.uuid}`,
                fullName: collaborator.fullName,
                email: collaborator.email,
                role: collaborator.displayRole,
                status: 'active',
                isSelf,
                onDelete: isSelf ? null : () => setRemovingUserUuid(collaborator.uuid),
            };
        }),
        ...pendingInvitations.map((invitation): CollaboratorRow => ({
            key: `invitation-${invitation.uuid}`,
            fullName: invitation.fullName,
            email: invitation.email,
            role: invitation.role,
            status: 'pending',
            isSelf: false,
            onDelete: () => openDeleteInvitation(invitation.uuid, invitation.fullName),
        })),
    ];

    return (
        <div className="px-4 md:px-6 py-4 md:py-5 border-t border-light-gray">
            <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h3 className="text-heading-sm">{t("settings:sections.collaborators")}</h3>
                <Button type="button" style="primary" width="w-auto" onClick={() => setIsInviteOpen(true)}>
                    <div className="flex flex-row items-center gap-2">
                        <PlusIcon className="size-4" strokeWidth={2} />
                        <p className="text-sm">{t("collaborators:invite.button")}</p>
                    </div>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                    <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                </div>
            ) : rows.length === 0 ? (
                <p className="text-body-sm text-gray text-center py-10">{t("collaborators:empty")}</p>
            ) : (
                <CollaboratorsTable rows={rows} />
            )}
        </div>
    );
}
