export enum PostDraftStatus {
    AwaitingReview = 'awaiting_review',
    ChangesRequested = 'changes_requested',
    Approved = 'approved',
    Archived = 'archived',
}

export const postDraftStatusTranslationKeys: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "postDrafts:status.awaitingReview",
    [PostDraftStatus.ChangesRequested]: "postDrafts:status.changesRequested",
    [PostDraftStatus.Approved]: "postDrafts:status.approved",
    [PostDraftStatus.Archived]: "postDrafts:status.archived",
};
