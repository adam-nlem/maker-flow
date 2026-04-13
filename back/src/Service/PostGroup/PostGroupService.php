<?php

namespace App\Service\PostGroup;

use App\DTO\AutoGroupSignal;
use App\DTO\Response\PostGroup\PostGroupListItemResponseDTO;
use App\DTO\Response\PostGroup\PostGroupWithAggregatedInsightsResponseDTO;
use App\DTO\Response\PostGroup\PostGroupWithInsightsAndScriptResponseDTO;
use App\Entity\Enum\PostInsightType;
use App\Helper\InsightHelper;
use App\Entity\Post;
use App\Entity\PostGroup;
use App\Entity\Project;
use App\Entity\User;
use App\Helper\CaptionHelper;
use App\Helper\ThumbnailHashHelper;
use App\Repository\PostGroupRepository;
use App\Repository\PostInsightRepository;
use App\Repository\PostRepository;
use App\Service\Post\PostThumbnailService;

class PostGroupService
{
    private const AUTO_GROUP_HOURS_WINDOW = 2;
    private const COMPOSITE_SCORE_THRESHOLD = 0.65;
    private const MIN_AVAILABLE_SIGNALS = 2;

    private const SIGNAL_WEIGHT_CAPTION = 0.40;
    private const SIGNAL_WEIGHT_DURATION = 0.30;
    private const SIGNAL_WEIGHT_THUMBNAIL = 0.15;
    private const SIGNAL_WEIGHT_TIME = 0.15;

    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly PostGroupRepository $postGroupRepository,
        private readonly PostInsightRepository $postInsightRepository,
        private readonly PostThumbnailService $postThumbnailService,
    ) {}

    /**
     * @return PostGroupWithAggregatedInsightsResponseDTO[]
     */
    public function getRankedPostGroups(User $user, Project $project, int $page, int $limit): array
    {
        $postGroupIds = $this->postGroupRepository->getRankedIdsByProjectAndUserSortedByInsightValue(
            $project,
            $user,
            PostInsightType::Views,
            $page,
            $limit,
        );

        if (empty($postGroupIds)) {
            return [];
        }

        $postGroups = $this->postGroupRepository->getByIds($postGroupIds);

        $idOrder = array_flip($postGroupIds);
        usort($postGroups, fn(PostGroup $a, PostGroup $b) => ($idOrder[$a->getId()] ?? 0) <=> ($idOrder[$b->getId()] ?? 0));

        $insightsByGroupId = [];
        foreach ($this->postInsightRepository->getAggregatedLatestByPostGroupIds($postGroupIds) as $row) {
            $type = $row['type'] instanceof PostInsightType ? $row['type']->value : $row['type'];
            $insightsByGroupId[$row['postGroupId']][] = ['type' => $type, 'value' => (float) $row['totalValue']];
        }

        return array_map(fn(PostGroup $pg) => new PostGroupWithAggregatedInsightsResponseDTO(
            postGroup: $pg,
            aggregatedInsights: $insightsByGroupId[$pg->getId()] ?? [],
        ), $postGroups);
    }

    /**
     * @return PostGroupListItemResponseDTO[]
     */
    public function getPostGroupListItems(
        User $user,
        Project $project,
        ?string $searchTerm,
        int $page,
        int $limit
    ): array {
        $postGroups = $this->postGroupRepository->getByProjectAndUserPaginatedAndSearchTerm($project, $user, $searchTerm, $page, $limit);

        if (empty($postGroups)) {
            return [];
        }

        $postGroupIds = array_map(fn(PostGroup $pg) => $pg->getId(), $postGroups);

        $insightsByGroupId = InsightHelper::buildAggregatedInsightsMapByGroupId(
            $this->postInsightRepository->getAggregatedLatestByPostGroupIds($postGroupIds),
        );

        return array_map(function (PostGroup $pg) use ($insightsByGroupId) {
            $insights = $insightsByGroupId[$pg->getId()] ?? [];

            return new PostGroupListItemResponseDTO(
                uuid: $pg->getUuid(),
                title: $pg->getTitle(),
                createdAt: $pg->getCreatedAt(),
                postCount: $pg->getPosts()->count(),
                views: InsightHelper::findAggregatedValue($insights, PostInsightType::Views),
                totalInteractions: InsightHelper::findAggregatedValue($insights, PostInsightType::TotalInteractions),
                engagementByViews: InsightHelper::calculateEngagementByViews($insights),
                scriptTitle: $pg->getScript()?->getTitle(),
            );
        }, $postGroups);
    }

    public function getPostGroupDetail(PostGroup $postGroup): PostGroupWithInsightsAndScriptResponseDTO
    {
        $insightRows = $this->postInsightRepository->getAggregatedLatestByPostGroupIds([$postGroup->getId()]);
        $insights = InsightHelper::buildAggregatedInsightsMapByGroupId($insightRows)[$postGroup->getId()] ?? [];

        return new PostGroupWithInsightsAndScriptResponseDTO(
            postGroup: $postGroup,
            aggregatedInsights: $insights,
            script: $postGroup->getScript(),
            engagementByViews: InsightHelper::calculateEngagementByViews($insights),
        );
    }

    public function tryAutoGroup(Post $post): void
    {
        if ($post->getPostGroup() !== null) {
            return;
        }

        $project = $post->getIntegration()->getProject();
        $user = $post->getUser();

        $candidates = $this->postRepository->getByProjectAndPublishedAtWindow(
            $project,
            $user,
            $post->getPublishedAt(),
            self::AUTO_GROUP_HOURS_WINDOW,
            $post->getIntegration(),
        );

        $bestCandidate = null;
        $bestScore = 0.0;

        foreach ($candidates as $candidate) {
            $score = $this->computeCompositeScore($post, $candidate);

            if ($score > $bestScore && $score >= self::COMPOSITE_SCORE_THRESHOLD) {
                $bestCandidate = $candidate;
                $bestScore = $score;
            }
        }

        if ($bestCandidate === null) {
            return;
        }

        $existingGroup = $bestCandidate->getPostGroup();

        if ($existingGroup !== null) {
            $post->setPostGroup($existingGroup);
            $this->postRepository->save($post, true);
        } else {
            $title = $this->resolveGroupTitle($post, $bestCandidate);

            $postGroup = new PostGroup();
            $postGroup
                ->setTitle($title)
                ->setUser($user)
                ->setProject($project);

            $this->postGroupRepository->save($postGroup);

            $bestCandidate->setPostGroup($postGroup);
            $this->postRepository->save($bestCandidate);

            $post->setPostGroup($postGroup);
            $this->postRepository->save($post, true);
        }
    }

    /**
     * Computes a composite similarity score between two posts by aggregating
     * weighted signals (caption, duration, thumbnail, time proximity).
     * Signals that are unavailable (e.g. no caption) are excluded and their
     * weight is redistributed proportionally to the remaining signals.
     * Returns 0.0 if fewer than MIN_AVAILABLE_SIGNALS signals are available.
     */
    private function computeCompositeScore(Post $post, Post $candidate): float
    {
        $signals = $this->collectSignals($post, $candidate);

        if (count($signals) < self::MIN_AVAILABLE_SIGNALS) {
            return 0.0;
        }

        $totalWeight = array_sum(array_map(fn(AutoGroupSignal $s) => $s->getWeight(), $signals));
        $weightedSum = array_sum(array_map(fn(AutoGroupSignal $s) => $s->getWeightedScore(), $signals));

        return $weightedSum / $totalWeight;
    }

    /**
     * Collects all available signals between two posts.
     * Each signal is only included if the required data is present on both posts.
     *
     * @return AutoGroupSignal[]
     */
    private function collectSignals(Post $post, Post $candidate): array
    {
        $signals = [];

        $captionScore = CaptionHelper::computeSimilarity($post->getCaption(), $candidate->getCaption());
        if ($captionScore !== null) {
            $signals[] = new AutoGroupSignal(self::SIGNAL_WEIGHT_CAPTION, $captionScore);
        }

        if ($post->getDuration() > 0 && $candidate->getDuration() > 0) {
            $signals[] = new AutoGroupSignal(
                self::SIGNAL_WEIGHT_DURATION,
                $this->computeDurationScore($post->getDuration(), $candidate->getDuration()),
            );
        }

        $thumbnailScore = $this->computeThumbnailScore($post, $candidate);
        if ($thumbnailScore !== null) {
            $signals[] = new AutoGroupSignal(self::SIGNAL_WEIGHT_THUMBNAIL, $thumbnailScore);
        }

        $signals[] = new AutoGroupSignal(
            self::SIGNAL_WEIGHT_TIME,
            $this->computeTimeScore($post->getPublishedAt(), $candidate->getPublishedAt()),
        );

        return $signals;
    }

    /**
     * Computes a stepped similarity score based on the absolute difference
     * between two video durations (in seconds).
     * Same video re-uploaded across platforms typically differs by <= 2 seconds.
     */
    private function computeDurationScore(int $durationA, int $durationB): float
    {
        $diff = abs($durationA - $durationB);

        return match (true) {
            $diff <= 2 => 1.0,
            $diff <= 5 => 0.8,
            $diff <= 10 => 0.5,
            default => 0.0,
        };
    }

    /**
     * Computes visual similarity between two post thumbnails using
     * average hash (aHash) comparison on 8x8 downscaled grayscale images.
     * Returns null if either thumbnail file is missing on disk.
     */
    private function computeThumbnailScore(Post $post, Post $candidate): ?float
    {
        $pathA = $this->postThumbnailService->getPath($post);
        $pathB = $this->postThumbnailService->getPath($candidate);

        if ($pathA === null || $pathB === null) {
            return null;
        }

        return ThumbnailHashHelper::computeSimilarity($pathA, $pathB);
    }

    /**
     * Computes a time proximity score using continuous linear decay.
     * Posts published at the same time score 1.0, posts at the edge of
     * the time window score 0.0.
     */
    private function computeTimeScore(\DateTimeImmutable $publishedAtA, \DateTimeImmutable $publishedAtB): float
    {
        $diffSeconds = abs($publishedAtA->getTimestamp() - $publishedAtB->getTimestamp());
        $diffHours = $diffSeconds / 3600.0;

        return max(0.0, 1.0 - ($diffHours / self::AUTO_GROUP_HOURS_WINDOW));
    }

    private function resolveGroupTitle(Post $post, Post $candidate): string
    {
        $caption = $post->getCaption();

        if ($caption !== null && trim($caption) !== '') {
            return mb_substr($caption, 0, 255);
        }

        $candidateCaption = $candidate->getCaption();

        if ($candidateCaption !== null && trim($candidateCaption) !== '') {
            return mb_substr($candidateCaption, 0, 255);
        }

        return sprintf('Post group - %s', $post->getPublishedAt()->format('Y-m-d'));
    }
}
