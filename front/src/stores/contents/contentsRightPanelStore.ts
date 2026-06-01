import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import { ContentsRightPanel } from '~/models/enums/ContentsRightPanel'

export { ContentsRightPanel }

type ContentsRightPanelState = {
    activePanel: ContentsRightPanel | null
}

type ContentsRightPanelAction = {
    openPanel: (panel: ContentsRightPanel) => void
    closePanel: () => void
    togglePanel: (panel: ContentsRightPanel) => void
}

export const useContentsRightPanelStore = createResettableStore<ContentsRightPanelState & ContentsRightPanelAction>()(
    persist(
        (set) => ({
            activePanel: null,
            openPanel: (panel) => set({ activePanel: panel }),
            closePanel: () => set({ activePanel: null }),
            togglePanel: (panel) => set((state) => ({
                activePanel: state.activePanel === panel ? null : panel,
            })),
        }),
        {
            name: "app:contents:right-panel",
        }
    )
)