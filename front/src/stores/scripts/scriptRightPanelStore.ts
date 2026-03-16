import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ScriptRightPanel } from '~/models/enums/ScriptRightPanel'

export { ScriptRightPanel }

type ScriptRightPanelState = {
    activePanel: ScriptRightPanel | null
}

type ScriptRightPanelAction = {
    openPanel: (panel: ScriptRightPanel) => void
    closePanel: () => void
    togglePanel: (panel: ScriptRightPanel) => void
}

export const useScriptRightPanelStore = create<ScriptRightPanelState & ScriptRightPanelAction>()(
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
            name: "app:scripts:right-panel",
        }
    )
)
