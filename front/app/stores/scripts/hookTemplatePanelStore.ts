import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type HookTemplatePanelState = {
    isOpen: boolean
}

type HookTemplatePanelAction = {
    toggle: () => void
    setIsOpen: (open: boolean) => void
}

export const useHookTemplatePanelStore = create<HookTemplatePanelState & HookTemplatePanelAction>()(
    persist(
        (set) => ({
            isOpen: false,
            toggle: () => set((state) => ({ isOpen: !state.isOpen })),
            setIsOpen: (open) => set({ isOpen: open }),
        }),
        {
            name: "app:scripts:hook-template-panel",
        }
    )
)
