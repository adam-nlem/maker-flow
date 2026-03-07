<?php

namespace App\Service\PostGroup;

use App\DTO\Response\PostGroup\PostGroupWithAggregatedInsightsResponseDTO;
use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostGroup;
use App\Entity\Project;
use App\Entity\User;
use App\Repository\PostGroupRepository;
use App\Repository\PostInsightRepository;
use App\Repository\PostRepository;

class PostGroupService
{
    private const AUTO_GROUP_HOURS_WINDOW = 2;
    private const CAPTION_SIMILARITY_THRESHOLD = 80;

    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly PostGroupRepository $postGroupRepository,
        private readonly PostInsightRepository $postInsightRepository,
    ) {}

    /**
     * @return PostGroupWithAggregatedInsightsResponseDTO[]
     */
    public function getRankedPostGroups(User $user, Project $project, int $limit): array
    {
        $postGroupIds = $this->postGroupRepository->getRankedIdsByProjectAndUserSortedByInsightValue(
            $project, $user, PostInsightType::Views, $limit,
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

    public function tryAutoGroup(Post $post): void
    {
        $caption = $post->getCaption();

        if ($caption === null || trim($caption) === '') {
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

        foreach ($candidates as $candidate) {
            if (!$this->areCaptionsSimilar($caption, $candidate->getCaption())) {
                continue;
            }

            $existingGroup = $candidate->getPostGroup();

            if ($existingGroup !== null) {
                $post->setPostGroup($existingGroup);
                $this->postRepository->save($post, true);
            } else {
                $postGroup = new PostGroup();
                $postGroup
                    ->setTitle($caption)
                    ->setUser($user)
                    ->setProject($project);

                $this->postGroupRepository->save($postGroup);

                $candidate->setPostGroup($postGroup);
                $this->postRepository->save($candidate);

                $post->setPostGroup($postGroup);
                $this->postRepository->save($post, true);
            }

            return;
        }
    }

    private function areCaptionsSimilar(?string $captionA, ?string $captionB): bool
    {
        if ($captionA === null || $captionB === null) {
            return false;
        }

        $percent = 0.0;
        similar_text($captionA, $captionB, $percent);

        return $percent >= self::CAPTION_SIMILARITY_THRESHOLD;
    }
}
