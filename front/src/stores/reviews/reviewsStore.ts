import { createResettableStore } from '~/stores/createResettableStore'

type ReviewsState = {
    selectedReviewUuid: string | null
    selectedVersionUuid: string | null
    isCreatePanelOpen: boolean
}

type ReviewsAction = {
    selectReview: (uuid: string | null) => void
    selectVersion: (uuid: string | null) => void
    openCreatePanel: () => void
    closeCreatePanel: () => void
    closeAll: () => void
}

export const useReviewsStore = createResettableStore<ReviewsState & ReviewsAction>()(
    (set) => ({
        selectedReviewUuid: null,
        selectedVersionUuid: null,
        isCreatePanelOpen: false,

        selectReview: (uuid) => set({
            selectedReviewUuid: uuid,
            selectedVersionUuid: null,
            isCreatePanelOpen: false,
        }),
        selectVersion: (uuid) => set({ selectedVersionUuid: uuid }),
        openCreatePanel: () => set({ isCreatePanelOpen: true }),
        closeCreatePanel: () => set({ isCreatePanelOpen: false }),
        closeAll: () => set({
            selectedReviewUuid: null,
            selectedVersionUuid: null,
            isCreatePanelOpen: false,
        }),
    })
)
