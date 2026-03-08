import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ScriptStatus } from '~/models/enums/ScriptStatus'

type HomeFilterState = {
    focusedIntegrationUuid: string | null,
    focusedScriptStatus: ScriptStatus,
}

type HomeFilterAction = {
    setFocusedIntegrationUuid: (focusedIntegrationUuid: string | null) => void
    setFocusedScriptStatus: (focusedScriptStatus: ScriptStatus) => void
}

export const useHomeFilterStore = create<HomeFilterState & HomeFilterAction>()(
    persist(
        (set) => ({
            focusedIntegrationUuid: null,
            setFocusedIntegrationUuid: (focusedIntegrationUuid) => set({ focusedIntegrationUuid: focusedIntegrationUuid }),
            focusedScriptStatus: ScriptStatus.Idea,
            setFocusedScriptStatus: (focusedScriptStatus) => set({ focusedScriptStatus: focusedScriptStatus }),
        }),
        {
            name: "app:home:filter-store",
        }
    )
)
