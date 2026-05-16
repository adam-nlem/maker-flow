import { createResettableStore } from '~/stores/createResettableStore'

type PostDraftsState = {
    selectedDraftUuid: string | null
    isCreatePanelOpen: boolean
}

type PostDraftsAction = {
    selectDraft: (uuid: string | null) => void
    openCreatePanel: () => void
    closeCreatePanel: () => void
    closeAll: () => void
}

export const usePostDraftsStore = createResettableStore<PostDraftsState & PostDraftsAction>()(
    (set) => ({
        selectedDraftUuid: null,
        isCreatePanelOpen: false,

        selectDraft: (uuid) => set({
            selectedDraftUuid: uuid,
            isCreatePanelOpen: false,
        }),
        openCreatePanel: () => set({ isCreatePanelOpen: true }),
        closeCreatePanel: () => set({ isCreatePanelOpen: false }),
        closeAll: () => set({
            selectedDraftUuid: null,
            isCreatePanelOpen: false,
        }),
    })
)
