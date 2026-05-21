<?php

namespace App\Controller;

use App\DTO\QueryParam\Review\ListReviewsQueryParamDTO;
use App\DTO\Request\Review\CreateReviewRequestDTO;
use App\DTO\Request\Review\UpdateReviewRequestDTO;
use App\DTO\Response\Review\ReviewWithLatestVersionResponseDTO;
use App\Entity\Enum\MediaType;
use App\Entity\Enum\ReviewStatus;
use App\Entity\Enum\UserRole;
use App\Entity\Enum\VideoStreamingStatus;
use App\Entity\Review;
use App\Entity\ReviewVersion;
use App\Entity\User;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\Review\MissingReviewException;
use App\Exception\Review\ReviewLockedException;
use App\Exception\Review\ScriptAlreadyHasReviewException;
use App\Message\ProcessReviewVideoMessage;
use App\Repository\ProjectRepository;
use App\Repository\ReviewRepository;
use App\Repository\ReviewVersionRepository;
use App\Repository\ScriptRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\Review\ReviewFileService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/reviews')]
final class ReviewController extends AbstractController
{
    #[Route('', name: 'api_reviews_list', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function list(
        ListReviewsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        ReviewRepository $reviewRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $project);

        $reviews = $reviewRepository->getByProjectPaginated(
            $project,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit(),
            $queryParamDto->getStatus(),
            $queryParamDto->getSearchTerm(),
        );

        $items = array_map(
            fn(Review $review) => ReviewWithLatestVersionResponseDTO::fromEntity($review),
            $reviews,
        );

        return $this->json(
            data: $items,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_reviews_list']],
        );
    }

    #[Route('/{reviewUuid}', name: 'api_reviews_show', methods: ['GET'], requirements: ['reviewUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::User->value)]
    public function show(string $reviewUuid, ReviewRepository $reviewRepository): JsonResponse
    {
        $review = $reviewRepository->getByUuid($reviewUuid);

        if ($review === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $review->getProject());

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity($review),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_reviews_show']],
        );
    }

    #[Route('', name: 'api_reviews_create', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function create(
        Request $request,
        CreateReviewRequestDTO $dto,
        ProjectRepository $projectRepository,
        ScriptRepository $scriptRepository,
        ReviewRepository $reviewRepository,
        ReviewVersionRepository $reviewVersionRepository,
        ReviewFileService $reviewFileService,
        EntityManagerInterface $entityManager,
        MessageBusInterface $messageBus,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $project);

        $script = null;
        if ($dto->getScriptUuid() !== null) {
            $script = $scriptRepository->getAccessibleByUuidForUser($dto->getScriptUuid(), $user);
        }

        $files = $request->files->all()['files'] ?? [];

        if (!is_array($files)) {
            $files = $files instanceof UploadedFile ? [$files] : [];
        }

        /** @var Review $review */
        $review = $dto->build();
        $review->setProject($project);
        $review->setScript($script);
        $review->setCreatedBy($user);

        $version = new ReviewVersion();
        $version->setReview($review);
        $version->setFileCount(count($files));

        if ($review->getMediaType() === MediaType::Video) {
            $version->setVideoStreamingStatus(VideoStreamingStatus::Pending);
        }

        $review->addVersion($version);

        $reviewRepository->save($review);
        $reviewVersionRepository->save($version);

        $reviewFileService->storeUploadedFiles($version, $files);

        try {
            $entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            $reviewFileService->deleteReviewVersion($version);
            throw new ScriptAlreadyHasReviewException();
        }

        if ($review->getMediaType() === MediaType::Video) {
            $messageBus->dispatch(new ProcessReviewVideoMessage($version->getId()));
        }

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity($review),
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_reviews_create']],
        );
    }

    #[Route('/{reviewUuid}', name: 'api_reviews_update', methods: ['PATCH'], requirements: ['reviewUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Editor->value)]
    public function update(
        string $reviewUuid,
        UpdateReviewRequestDTO $dto,
        ReviewRepository $reviewRepository,
        ScriptRepository $scriptRepository,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $review = $reviewRepository->getByUuid($reviewUuid);

        if ($review === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $review->getProject());

        if ($review->getLatestVersion()?->getStatus() !== ReviewStatus::Pending) {
            throw new ReviewLockedException();
        }

        if ($dto->hasTitle() && $dto->getTitle() !== null && $dto->getTitle() !== '') {
            $review->setTitle($dto->getTitle());
        }

        if ($dto->hasDescription()) {
            $review->setDescription($dto->getDescription());
        }

        if ($dto->hasNotes()) {
            $review->setNotes($dto->getNotes());
        }

        if ($dto->hasScriptUuid()) {
            $scriptUuid = $dto->getScriptUuid();

            if ($scriptUuid === null) {
                $review->setScript(null);
            } else {
                $script = $scriptRepository->getAccessibleByUuidForUser($scriptUuid, $user);
                $review->setScript($script);
            }
        }

        try {
            $entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            throw new ScriptAlreadyHasReviewException();
        }

        return $this->json(
            data: ReviewWithLatestVersionResponseDTO::fromEntity($review),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_reviews_update']],
        );
    }

    #[Route('/{reviewUuid}', name: 'api_reviews_delete', methods: ['DELETE'], requirements: ['reviewUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Editor->value)]
    public function delete(
        string $reviewUuid,
        ReviewRepository $reviewRepository,
    ): JsonResponse {
        $review = $reviewRepository->getByUuid($reviewUuid);

        if ($review === null) {
            throw new MissingReviewException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $review->getProject());

        $reviewRepository->remove($review, true);

        return $this->json(
            data: ["message" => "Review deleted successfully"],
            status: Response::HTTP_OK,
        );
    }
}
