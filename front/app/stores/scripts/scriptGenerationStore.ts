import { create } from 'zustand'

type ScriptGenerationState = {
    activeGenerationUuid: string | null
    focusedGenerationUuid: string | undefined
}

type ScriptGenerationAction = {
    setActiveGenerationUuid: (uuid: string | null) => void
    clearActiveGeneration: () => void
    setFocusedGenerationUuid: (uuid: string | undefined) => void
}

export const useScriptGenerationStore = create<ScriptGenerationState & ScriptGenerationAction>()(
    (set) => ({
        activeGenerationUuid: null,
        focusedGenerationUuid: undefined,
        setActiveGenerationUuid: (uuid) => set({ activeGenerationUuid: uuid }),
        clearActiveGeneration: () => set({ activeGenerationUuid: null }),
        setFocusedGenerationUuid: (uuid) => set({ focusedGenerationUuid: uuid }),
    })
)
