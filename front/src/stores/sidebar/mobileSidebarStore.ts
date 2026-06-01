import { createResettableStore } from '~/stores/createResettableStore'

type MobileSidebarState = {
    isOpen: boolean
}

type MobileSidebarAction = {
    setIsOpen: (isOpen: boolean) => void
    toggle: () => void
}

export const useMobileSidebarStore = createResettableStore<MobileSidebarState & MobileSidebarAction>()((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
