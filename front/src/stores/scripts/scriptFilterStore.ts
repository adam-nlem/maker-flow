import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'
import { ScriptStatus } from '~/models/enums/ScriptStatus'

type ScriptFilterState = {
    focusedScriptStatus: ScriptStatus
}

type ScriptFilterAction = {
    setFocusedScriptStatus: (focusedScriptStatus: ScriptStatus) => void
}

export const useScriptFilterStore = createResettableStore<ScriptFilterState & ScriptFilterAction>()(
    persist(
        (set) => ({
            focusedScriptStatus: ScriptStatus.Idea,
            setFocusedScriptStatus: (focusedScriptStatus) => set({ focusedScriptStatus }),
        }),
        {
            name: "app:scripts:filter",
        }
    )
)
