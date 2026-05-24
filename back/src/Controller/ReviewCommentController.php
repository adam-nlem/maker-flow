<?php

namespace App\Controller;

use App\DTO\QueryParam\Review\ListPendingReviewCommentsQueryParamDTO;
use App\DTO\QueryParam\Review\ListReviewCommentsQueryParamDTO;
use App\DTO\Request\Review\CreateReviewCommentRequestDTO;
use App\DTO\Request\Review\UpdateReviewCommentRequestDTO;
use App\DTO\Response\Review\ListReviewCommentsGroupedByReviewResponseDTO;
use App\DTO\Response\Review\ReviewWithLatestVersionResponseDTO;
use App\Entity\Enum\UserRole;
use App\Entity\Review;
use App\Entity\ReviewComment;
use App\Entity\User;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\Review\MissingReviewException;
use App\Exception\Review\ReviewCommentEditForbiddenException;
use App\Exception\Review\ReviewCommentEmptyException;
use App\Exception\Review\ReviewCommentNotFoundException;
use App\Exception\Review\ReviewCommentParentNotFoundException;
use App\Exception\Review\ReviewCommentReplyCannotHaveTimecodeException;
use App\Exception\Review\ReviewCommentStatusInvalidException;
use App\Exception\Review\ReviewCommentStatusOnReplyForbiddenException;
use App\Exception\Review\ReviewCommentTimecodeOnReplyForbiddenException;
use App\Exception\Review\ReviewVersionNotLatestException;
use App\Repository\ProjectRepository;
use App\Repository\ReviewCommentRepository;
use App\Repository\ReviewRepository;
use App\Repository\ReviewVersionRepository;
use App\Security\Voter\ProjectVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/review-comments')]
final class ReviewCommentController extends AbstractController
{
    #[Route('', name: 'api_review_comments_list', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function list(
        ListReviewCommentsQueryParamDTO $queryParamDto,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewCommentRepository $reviewCommentRepository,
    ): JsonResponse {
        $reviewVersion = $reviewVersionRepository->getByUuid($queryParamDto->getReviewVersionUuid());

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $reviewVersion->getReview()->getProject());

        $comments = $reviewCommentRepository->getByReviewVersionPaginated(
            $reviewVersion,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit(),
        );

        return $this->json(
            data: $comments,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_comments_list']],
        );
    }

    #[Route('/pending', name: 'api_review_comments_pending', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function pending(
        ListPendingReviewCommentsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        ReviewRepository $reviewRepository,
        ReviewCommentRepository $reviewCommentRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $project);

        $reviews = $reviewRepository->getByProjectWithPendingCommentsPaginated(
            $project,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit(),
        );

        $commentsByReviewId = $reviewCommentRepository->getOpenTopLevelForLatestVersionByReviews($reviews);

        $items = array_map(
            fn(Review $review) => new ListReviewCommentsGroupedByReviewResponseDTO(
                review: ReviewWithLatestVersionResponseDTO::fromEntity(
                    $review,
                    count($commentsByReviewId[$review->getId()] ?? []),
                ),
                comments: $commentsByReviewId[$review->getId()] ?? [],
            ),
            $reviews,
        );

        return $this->json(
            data: $items,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_comments_pending']],
        );
    }

    #[Route('', name: 'api_review_comments_create', methods: ['POST'])]
    #[IsGranted(UserRole::User->value)]
    public function create(
        CreateReviewCommentRequestDTO $dto,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewCommentRepository $reviewCommentRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $reviewVersion = $reviewVersionRepository->getByUuid($dto->getReviewVersionUuid());

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $review = $reviewVersion->getReview();

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $review->getProject());

        if ($review->getLatestVersion() !== $reviewVersion) {
            throw new ReviewVersionNotLatestException();
        }

        $parentComment = null;
        if ($dto->getParentCommentUuid() !== null) {
            $parentComment = $reviewCommentRepository->getByUuid($dto->getParentCommentUuid());

            if ($parentComment === null || $parentComment->getReviewVersion() !== $reviewVersion) {
                throw new ReviewCommentParentNotFoundException();
            }

            if ($dto->getVideoTimecodeSeconds() !== null) {
                throw new ReviewCommentReplyCannotHaveTimecodeException();
            }
        }

        /** @var ReviewComment $comment */
        $comment = $dto->build();
        $comment->setAuthor($user);

        if ($parentComment !== null) {
            $comment->setParentComment($parentComment);
        }

        if ($dto->getVideoTimecodeSeconds() !== null) {
            $comment->setVideoTimecodeSeconds($dto->getVideoTimecodeSeconds());
        }

        $reviewVersion->addComment($comment);

        $reviewCommentRepository->save($comment, true);

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity(
                $review,
                $reviewCommentRepository->countOpenTopLevelForVersion($reviewVersion),
            ),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_comments_create']],
        );
    }

    #[Route('/{commentUuid}', name: 'api_review_comments_update', methods: ['PATCH'], requirements: ['commentUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::User->value)]
    public function update(
        string $commentUuid,
        UpdateReviewCommentRequestDTO $dto,
        ReviewCommentRepository $reviewCommentRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $comment = $reviewCommentRepository->getByUuid($commentUuid);

        if ($comment === null) {
            throw new ReviewCommentNotFoundException();
        }

        $review = $comment->getReviewVersion()->getReview();

        // Endpoint floor: any project member can reach it. Per-field guards below layer the real rules
        // (author-only edits for body/timecode, agency-only for status).
        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $review->getProject());

        $dto->build();

        if ($dto->hasBody()) {
            // Content edits belong to the author — clients can fix their own comments.
            if ($comment->getAuthor()?->getId() !== $user->getId()) {
                throw new ReviewCommentEditForbiddenException();
            }

            $body = $dto->getBody();
            if ($body === null || $body === '') {
                throw new ReviewCommentEmptyException();
            }

            if ($body !== $comment->getBody()) {
                $comment->setBody($body);
            }
        }

        if ($dto->hasVideoTimecodeSeconds()) {
            // Same rule as body — the author owns where their own comment is pinned.
            if ($comment->getAuthor()?->getId() !== $user->getId()) {
                throw new ReviewCommentEditForbiddenException();
            }

            if (!$comment->isTopLevel()) {
                throw new ReviewCommentTimecodeOnReplyForbiddenException();
            }

            if ($dto->getVideoTimecodeSeconds() !== $comment->getVideoTimecodeSeconds()) {
                $comment->setVideoTimecodeSeconds($dto->getVideoTimecodeSeconds());
            }
        }

        if ($dto->hasStatus()) {
            // Resolution is an agency workflow action — gate it on EDIT regardless of comment author.
            $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $review->getProject());

            if ($dto->getStatus() === null) {
                throw new ReviewCommentStatusInvalidException();
            }

            if (!$comment->isTopLevel()) {
                throw new ReviewCommentStatusOnReplyForbiddenException();
            }

            if ($dto->getStatus() !== $comment->getStatus()) {
                $comment->setStatus($dto->getStatus());
            }
        }

        $reviewCommentRepository->save($comment, true);

        $latestVersion = $review->getLatestVersion();
        $unresolvedCount = $latestVersion === null
            ? 0
            : $reviewCommentRepository->countOpenTopLevelForVersion($latestVersion);

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity($review, $unresolvedCount),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_comments_update']],
        );
    }
}
