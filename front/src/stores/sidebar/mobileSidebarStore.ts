import { create } from 'zustand'

type MobileSidebarState = {
    isOpen: boolean
}

type MobileSidebarAction = {
    setIsOpen: (isOpen: boolean) => void
    toggle: () => void
}

export const useMobileSidebarStore = create<MobileSidebarState & MobileSidebarAction>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
