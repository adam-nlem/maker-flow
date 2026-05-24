<?php

namespace App\Controller;

use App\DTO\QueryParam\Review\StreamFileQueryParamDTO;
use App\DTO\Request\Review\CreateReviewVersionRequestDTO;
use App\DTO\Response\Review\ReviewWithLatestVersionResponseDTO;
use App\Entity\Enum\MediaType;
use App\Entity\Enum\ReviewStatus;
use App\Entity\Enum\UserRole;
use App\Entity\Enum\VideoStreamingStatus;
use App\Entity\ReviewVersion;
use App\Exception\Review\MissingReviewException;
use App\Exception\Review\ReviewVersionNotLatestException;
use App\Exception\Review\ReviewVersionNotPendingException;
use App\Message\ProcessReviewVideoMessage;
use App\Repository\ReviewCommentRepository;
use App\Repository\ReviewRepository;
use App\Repository\ReviewVersionRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\Review\ReviewFileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Messenger\MessageBusInterface;
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

    #[Route('', name: 'api_review_versions_create', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function create(
        Request $request,
        CreateReviewVersionRequestDTO $dto,
        ReviewRepository $reviewRepository,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewCommentRepository $reviewCommentRepository,
        ReviewFileService $reviewFileService,
        EntityManagerInterface $entityManager,
        MessageBusInterface $messageBus,
    ): JsonResponse {
        $review = $reviewRepository->getByUuid($dto->getReviewUuid());

        if ($review === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $review->getProject());

        $files = $request->files->all()['files'] ?? [];

        if (!is_array($files)) {
            $files = $files instanceof UploadedFile ? [$files] : [];
        }

        /** @var ReviewVersion $version */
        $version = $dto->build();
        $version->setReview($review);
        $version->setFileCount(count($files));

        if ($review->getMediaType() === MediaType::Video) {
            $version->setVideoStreamingStatus(VideoStreamingStatus::Pending);
        }

        $review->addVersion($version);

        $reviewVersionRepository->save($version);

        $reviewFileService->storeUploadedFiles($version, $files);

        $entityManager->flush();

        if ($review->getMediaType() === MediaType::Video) {
            $messageBus->dispatch(new ProcessReviewVideoMessage($version->getId()));
        }

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity(
                $review,
                $reviewCommentRepository->countOpenTopLevelForVersion($version),
            ),
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_review_versions_create']],
        );
    }

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

    #[Route(
        '/{reviewVersionUuid}/cover',
        name: 'api_review_versions_cover',
        requirements: ['reviewVersionUuid' => Requirement::UUID],
        methods: ['GET'],
    )]
    #[IsGranted(UserRole::User->value)]
    public function showCover(
        string $reviewVersionUuid,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewFileService $reviewFileService,
    ): Response {
        $reviewVersion = $reviewVersionRepository->getByUuid($reviewVersionUuid);

        if ($reviewVersion === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $reviewVersion->getReview()->getProject());

        $coverFile = $reviewFileService->getCoverFile($reviewVersion);

        if ($coverFile === null) {
            return new Response(null, Response::HTTP_NO_CONTENT);
        }

        return new BinaryFileResponse(
            $coverFile,
            Response::HTTP_OK,
            ['Content-Type' => 'image/jpeg'],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE,
        );
    }

    #[Route('/{reviewVersionUuid}/approve', name: 'api_review_versions_approve', methods: ['POST'], requirements: ['reviewVersionUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Client->value)]
    public function approve(
        string $reviewVersionUuid,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewCommentRepository $reviewCommentRepository,
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
            data: ReviewWithLatestVersionResponseDTO::fromEntity(
                $review,
                $reviewCommentRepository->countOpenTopLevelForVersion($reviewVersion),
            ),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_review_versions_approve']],
        );
    }

}
