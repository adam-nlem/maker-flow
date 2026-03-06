<?php

namespace App\Service\PostGroup;

use App\Entity\Post;
use App\Entity\PostGroup;
use App\Repository\PostGroupRepository;
use App\Repository\PostRepository;

class PostGroupService
{
    private const AUTO_GROUP_HOURS_WINDOW = 2;
    private const CAPTION_SIMILARITY_THRESHOLD = 80;

    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly PostGroupRepository $postGroupRepository,
    ) {}

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
