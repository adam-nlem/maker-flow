import { createResettableStore } from '~/stores/createResettableStore'

type ReviewsState = {
    selectedReviewUuid: string | null
    isCreatePanelOpen: boolean
}

type ReviewsAction = {
    selectReview: (uuid: string | null) => void
    openCreatePanel: () => void
    closeCreatePanel: () => void
    closeAll: () => void
}

export const useReviewsStore = createResettableStore<ReviewsState & ReviewsAction>()(
    (set) => ({
        selectedReviewUuid: null,
        isCreatePanelOpen: false,

        selectReview: (uuid) => set({
            selectedReviewUuid: uuid,
            isCreatePanelOpen: false,
        }),
        openCreatePanel: () => set({ isCreatePanelOpen: true }),
        closeCreatePanel: () => set({ isCreatePanelOpen: false }),
        closeAll: () => set({
            selectedReviewUuid: null,
            isCreatePanelOpen: false,
        }),
    })
)
