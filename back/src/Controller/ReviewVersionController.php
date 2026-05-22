<?php

namespace App\Controller;

use App\DTO\QueryParam\Review\StreamFileQueryParamDTO;
use App\DTO\Request\Review\RequestChangesOnReviewVersionRequestDTO;
use App\DTO\Response\Review\ReviewWithLatestVersionResponseDTO;
use App\Entity\Enum\ReviewStatus;
use App\Entity\Enum\UserRole;
use App\Entity\ReviewComment;
use App\Entity\User;
use App\Exception\Review\MissingReviewException;
use App\Exception\Review\ReviewVersionNotLatestException;
use App\Exception\Review\ReviewVersionNotPendingException;
use App\Exception\Review\ReviewVersionNotPendingOrApprovedException;
use App\Repository\ReviewCommentRepository;
use App\Repository\ReviewVersionRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\Review\ReviewFileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/review-versions')]
final class ReviewVersionController extends AbstractController
{
    private const HLS_CONTENT_TYPES = [
        'm3u8' => 'application/vnd.apple.mpegurl',
        'ts' => 'video/mp2t',
    ];

    #[Route('/files', name: 'api_review_versions_stream_file', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function streamFile(
        StreamFileQueryParamDTO $queryParamDto,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewFileService $reviewFileService,
    ): Response {
        $reviewVersion = $reviewVersionRepository->getByUuid($queryParamDto->getReviewVersionUuid());

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $reviewVersion->getReview()->getProject());

        $file = $reviewFileService->getFileByIndex($reviewVersion, $queryParamDto->getIndex());

        if ($file === null) {
            throw new MissingReviewException();
        }

        return new BinaryFileResponse(
            $file,
            Response::HTTP_OK,
            ['Content-Type' => $file->getMimeType() ?? 'application/octet-stream'],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE,
        );
    }

    #[Route(
        '/{reviewVersionUuid}/stream/{path}',
        name: 'api_review_versions_stream_hls',
        requirements: ['reviewVersionUuid' => Requirement::UUID, 'path' => '.+'],
        methods: ['GET'],
    )]
    #[IsGranted(UserRole::User->value)]
    public function streamHls(
        string $reviewVersionUuid,
        string $path,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewFileService $reviewFileService,
    ): Response {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if (!isset(self::HLS_CONTENT_TYPES[$extension])) {
            throw new MissingReviewException();
        }

        $reviewVersion = $reviewVersionRepository->getByUuid($reviewVersionUuid);

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $reviewVersion->getReview()->getProject());

        $file = $reviewFileService->getStreamFile($reviewVersion, $path);

        if ($file === null) {
            throw new MissingReviewException();
        }

        return new BinaryFileResponse(
            $file,
            Response::HTTP_OK,
            ['Content-Type' => self::HLS_CONTENT_TYPES[$extension]],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE,
        );
    }

    #[Route('/{reviewVersionUuid}/approve', name: 'api_review_versions_approve', methods: ['POST'], requirements: ['reviewVersionUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Client->value)]
    public function approve(
        string $reviewVersionUuid,
        ReviewVersionRepository $reviewVersionRepository,
    ): JsonResponse {
        $reviewVersion = $reviewVersionRepository->getByUuid($reviewVersionUuid);

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $review = $reviewVersion->getReview();

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $review->getProject());

        if ($review->getLatestVersion() !== $reviewVersion) {
            throw new ReviewVersionNotLatestException();
        }

        if ($reviewVersion->getStatus() !== ReviewStatus::Pending) {
            throw new ReviewVersionNotPendingException();
        }

        $reviewVersion->setStatus(ReviewStatus::Approved);

        $reviewVersionRepository->save($reviewVersion, true);

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity($review),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_versions_approve']],
        );
    }

    #[Route('/{reviewVersionUuid}/request-changes', name: 'api_review_versions_request_changes', methods: ['POST'], requirements: ['reviewVersionUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Client->value)]
    public function requestChanges(
        string $reviewVersionUuid,
        RequestChangesOnReviewVersionRequestDTO $dto,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewCommentRepository $reviewCommentRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $reviewVersion = $reviewVersionRepository->getByUuid($reviewVersionUuid);

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $review = $reviewVersion->getReview();

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $review->getProject());

        if ($review->getLatestVersion() !== $reviewVersion) {
            throw new ReviewVersionNotLatestException();
        }

        if (!in_array($reviewVersion->getStatus(), [ReviewStatus::Pending, ReviewStatus::Approved], true)) {
            throw new ReviewVersionNotPendingOrApprovedException();
        }

        $comment = new ReviewComment();
        $comment->setReviewVersion($reviewVersion);
        $comment->setAuthor($user);
        $comment->setBody($dto->getComment());
        $reviewVersion->addComment($comment);

        $reviewVersion->setStatus(ReviewStatus::ChangesRequested);

        $reviewCommentRepository->save($comment, true);

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity($review),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_versions_request_changes']],
        );
    }
}
