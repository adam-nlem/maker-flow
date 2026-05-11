import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import Shimmer from "~/components/ui/Shimmer";
import { SettingsSection, settingsSectionTranslationKeys } from "~/models/enums/SettingsSection";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListCollaborators } from "~/hooks/api/collaborators/useListCollaborators";
import { useCollaboratorModalsStore } from "~/stores/collaborators/collaboratorModalsStore";
import CollaboratorsTable, { type CollaboratorRow } from "./CollaboratorsTable";
import InviteCollaboratorModal from "./InviteCollaboratorModal";
import RemoveCollaboratorModal from "./RemoveCollaboratorModal";
import DeleteInvitationModal from "~/components/invitations/DeleteInvitationModal";

export default function CollaboratorsSettings() {
    const { t } = useTranslation();
    const { user: currentUser } = useCurrentUser();
    const { agencyCollaborators, isLoading } = useListCollaborators();

    const isInviteOpen = useCollaboratorModalsStore((s) => s.isInviteOpen);
    const setIsInviteOpen = useCollaboratorModalsStore((s) => s.setIsInviteOpen);
    const removingUserUuid = useCollaboratorModalsStore((s) => s.removingUserUuid);
    const setRemovingUserUuid = useCollaboratorModalsStore((s) => s.setRemovingUserUuid);
    const deletingInvitationUuid = useCollaboratorModalsStore((s) => s.deletingInvitationUuid);
    const deletingInvitationLabel = useCollaboratorModalsStore((s) => s.deletingInvitationLabel);
    const openDeleteInvitation = useCollaboratorModalsStore((s) => s.openDeleteInvitation);
    const closeDeleteInvitation = useCollaboratorModalsStore((s) => s.closeDeleteInvitation);

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

    const removingUser = collaborators.find((collaborator) => collaborator.uuid === removingUserUuid) ?? null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-light-gray flex flex-row justify-between items-center gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="text-heading-xl">{t(settingsSectionTranslationKeys[SettingsSection.Collaborators])}</h2>
                    <p className="text-body-sm text-gray">{t("collaborators:subtitle")}</p>
                </div>
                <Button type="button" style="primary" width="w-auto" onClick={() => setIsInviteOpen(true)}>
                    <div className="flex flex-row items-center gap-2">
                        <PlusIcon className="size-4" strokeWidth={2} />
                        <p className="text-sm">{t("collaborators:invite.button")}</p>
                    </div>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
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

            <InviteCollaboratorModal showModal={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

            <RemoveCollaboratorModal
                isOpen={removingUserUuid !== null}
                userUuid={removingUserUuid}
                displayLabel={removingUser?.fullName ?? ''}
                onClose={() => setRemovingUserUuid(null)}
            />

            <DeleteInvitationModal
                isOpen={deletingInvitationUuid !== null}
                invitationUuid={deletingInvitationUuid}
                displayLabel={deletingInvitationLabel}
                onClose={closeDeleteInvitation}
            />
        </div>
    );
}
