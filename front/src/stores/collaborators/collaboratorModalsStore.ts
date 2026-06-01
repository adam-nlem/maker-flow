import { createResettableStore } from '~/stores/createResettableStore'

type CollaboratorModalsState = {
    isInviteOpen: boolean
    removingUserUuid: string | null
    deletingInvitationUuid: string | null
    deletingInvitationLabel: string
}

type CollaboratorModalsAction = {
    setIsInviteOpen: (isOpen: boolean) => void
    setRemovingUserUuid: (uuid: string | null) => void
    openDeleteInvitation: (uuid: string, label: string) => void
    closeDeleteInvitation: () => void
}

export const useCollaboratorModalsStore = createResettableStore<CollaboratorModalsState & CollaboratorModalsAction>()((set) => ({
    isInviteOpen: false,
    removingUserUuid: null,
    deletingInvitationUuid: null,
    deletingInvitationLabel: '',
    setIsInviteOpen: (isOpen) => set({ isInviteOpen: isOpen }),
    setRemovingUserUuid: (uuid) => set({ removingUserUuid: uuid }),
    openDeleteInvitation: (uuid, label) => set({ deletingInvitationUuid: uuid, deletingInvitationLabel: label }),
    closeDeleteInvitation: () => set({ deletingInvitationUuid: null, deletingInvitationLabel: '' }),
}))
