import { create } from 'zustand'
import type { HookTemplate } from '~/models/HookTemplate'

type HookTemplateState = {
    selectedTemplate: HookTemplate | null
    focusedHookTemplateUuid: string | null
}

type HookTemplateAction = {
    setSelectedTemplate: (template: HookTemplate | null) => void
    setFocusedHookTemplateUuid: (uuid: string | null) => void
}

export const useHookTemplateStore = create<HookTemplateState & HookTemplateAction>()(
    (set) => ({
        selectedTemplate: null,
        focusedHookTemplateUuid: null,
        setSelectedTemplate: (template) => set({ selectedTemplate: template }),
        setFocusedHookTemplateUuid: (uuid) => set({ focusedHookTemplateUuid: uuid }),
    })
)
