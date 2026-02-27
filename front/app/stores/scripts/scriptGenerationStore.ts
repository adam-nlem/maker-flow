import { create } from 'zustand'

type ScriptGenerationState = {
    activeGenerationUuid: string | null
}

type ScriptGenerationAction = {
    setActiveGenerationUuid: (uuid: string | null) => void
    clearActiveGeneration: () => void
}

export const useScriptGenerationStore = create<ScriptGenerationState & ScriptGenerationAction>()(
    (set) => ({
        activeGenerationUuid: null,
        setActiveGenerationUuid: (uuid) => set({ activeGenerationUuid: uuid }),
        clearActiveGeneration: () => set({ activeGenerationUuid: null }),
    })
)
