import { createResettableStore } from '~/stores/createResettableStore'

type CreateProjectModalState = {
    isCreateModalOpen: boolean
}

type CreateProjectModalAction = {
    setIsCreateModalOpen: (isOpen: boolean) => void
}

export const useCreateProjectModalStore = createResettableStore<CreateProjectModalState & CreateProjectModalAction>()((set) => ({
    isCreateModalOpen: false,
    setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen })
}))
