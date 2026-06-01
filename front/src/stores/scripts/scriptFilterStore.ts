import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import { ScriptStatus } from '~/models/enums/ScriptStatus'

type ScriptFilterState = {
    focusedScriptStatus: ScriptStatus
    searchTerm: string
}

type ScriptFilterAction = {
    setFocusedScriptStatus: (focusedScriptStatus: ScriptStatus) => void
    setSearchTerm: (searchTerm: string) => void
}

export const useScriptFilterStore = createResettableStore<ScriptFilterState & ScriptFilterAction>()(
    persist(
        (set) => ({
            focusedScriptStatus: ScriptStatus.Idea,
            searchTerm: "",
            setFocusedScriptStatus: (focusedScriptStatus) => set({ focusedScriptStatus }),
            setSearchTerm: (searchTerm) => set({ searchTerm }),
        }),
        {
            name: "app:scripts:filter",
            partialize: (state) => ({ focusedScriptStatus: state.focusedScriptStatus }),
        }
    )
)
