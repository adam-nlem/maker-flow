import Shimmer from "~/components/ui/Shimmer";
import { useCurrentAgency } from "~/hooks/api/agency/useCurrentAgency";
import { useListCollaborators } from "~/hooks/api/collaborators/useListCollaborators";
import { useCollaboratorModalsStore } from "~/stores/collaborators/collaboratorModalsStore";
import AgencySettingsForm from "./agency/AgencySettingsForm";
import CollaboratorsSection from "./agency/CollaboratorsSection";
import InviteCollaboratorModal from "./agency/InviteCollaboratorModal";
import RemoveCollaboratorModal from "./agency/RemoveCollaboratorModal";
import DeleteInvitationModal from "~/components/invitations/DeleteInvitationModal";

export default function AgencySettings() {
    const { agency, isLoading } = useCurrentAgency();
    const { agencyCollaborators } = useListCollaborators();

    const isInviteOpen = useCollaboratorModalsStore((s) => s.isInviteOpen);
    const setIsInviteOpen = useCollaboratorModalsStore((s) => s.setIsInviteOpen);
    const removingUserUuid = useCollaboratorModalsStore((s) => s.removingUserUuid);
    const setRemovingUserUuid = useCollaboratorModalsStore((s) => s.setRemovingUserUuid);
    const deletingInvitationUuid = useCollaboratorModalsStore((s) => s.deletingInvitationUuid);
    const deletingInvitationLabel = useCollaboratorModalsStore((s) => s.deletingInvitationLabel);
    const closeDeleteInvitation = useCollaboratorModalsStore((s) => s.closeDeleteInvitation);

    const removingUser = agencyCollaborators?.collaborators.find((c) => c.uuid === removingUserUuid) ?? null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {isLoading || !agency ? (
                    <div className="px-4 md:px-6 py-4 md:py-5 flex flex-col gap-4">
                        <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                        <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                        <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                    </div>
                ) : (
                    <>
                        <AgencySettingsForm agency={agency} />
                        <CollaboratorsSection />
                    </>
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
