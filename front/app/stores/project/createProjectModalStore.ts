import { create } from 'zustand'

type CreateProjectModalState = {
    isCreateModalOpen: boolean
}

type CreateProjectModalAction = {
    setIsCreateModalOpen: (isOpen: boolean) => void
}

export const useCreateProjectModalStore = create<CreateProjectModalState & CreateProjectModalAction>((set) => ({
    isCreateModalOpen: false,
    setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen })
}))
