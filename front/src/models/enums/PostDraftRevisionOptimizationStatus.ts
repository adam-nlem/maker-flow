export enum PostDraftRevisionOptimizationStatus {
    Pending = 'pending',
    Optimizing = 'optimizing',
    Optimized = 'optimized',
    Failed = 'failed',
}

export const postDraftRevisionOptimizationStatusTranslationKeys: Record<PostDraftRevisionOptimizationStatus, string> = {
    [PostDraftRevisionOptimizationStatus.Pending]: "postDrafts:optimization.pending",
    [PostDraftRevisionOptimizationStatus.Optimizing]: "postDrafts:optimization.optimizing",
    [PostDraftRevisionOptimizationStatus.Optimized]: "postDrafts:optimization.optimized",
    [PostDraftRevisionOptimizationStatus.Failed]: "postDrafts:optimization.failed",
};
