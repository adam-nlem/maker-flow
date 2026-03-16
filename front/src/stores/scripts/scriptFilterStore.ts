import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ScriptStatus } from '~/models/enums/ScriptStatus'

type ScriptFilterState = {
    focusedScriptStatus: ScriptStatus
}

type ScriptFilterAction = {
    setFocusedScriptStatus: (focusedScriptStatus: ScriptStatus) => void
}

export const useScriptFilterStore = create<ScriptFilterState & ScriptFilterAction>()(
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
