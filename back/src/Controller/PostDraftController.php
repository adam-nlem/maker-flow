<?php

namespace App\Controller;

use App\DTO\QueryParam\PostDraft\ListPostDraftsQueryParamDTO;
use App\DTO\Request\PostDraft\CreatePostDraftRequestDTO;
use App\DTO\Request\PostDraft\UpdatePostDraftRequestDTO;
use App\Entity\Enum\PostDraftStatus;
use App\Entity\Enum\UserRole;
use App\Entity\PostDraft;
use App\Entity\PostDraftMediaVersion;
use App\Entity\User;
use App\Exception\PostDraft\MissingPostDraftException;
use App\Exception\PostDraft\PostDraftLockedException;
use App\Exception\PostDraft\ScriptAlreadyHasPostDraftException;
use App\Exception\Project\ProjectNotFoundException;
use App\Repository\PostDraftMediaVersionRepository;
use App\Repository\PostDraftRepository;
use App\Repository\ProjectRepository;
use App\Repository\ScriptRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\PostDraft\PostDraftFileService;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/post-drafts')]
final class PostDraftController extends AbstractController
{
    #[Route('', name: 'api_post_drafts_list', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function list(
        ListPostDraftsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        PostDraftRepository $postDraftRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $project);

        $postDrafts = $postDraftRepository->getByProjectPaginated(
            $project,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit(),
            $queryParamDto->getStatus(),
            $queryParamDto->getSearchTerm(),
        );

        return $this->json(
            data: $postDrafts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_drafts_list']],
        );
    }

    #[Route('/{uuid}', name: 'api_post_drafts_show', methods: ['GET'], requirements: ['uuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Viewer->value)]
    public function show(string $uuid, PostDraftRepository $postDraftRepository): JsonResponse
    {
        $postDraft = $postDraftRepository->getByUuid($uuid);

        if ($postDraft === null) {
            throw new MissingPostDraftException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $postDraft->getProject());

        return $this->json(
            data: $postDraft,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_drafts_show']],
        );
    }

    #[Route('', name: 'api_post_drafts_create', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function create(
        Request $request,
        CreatePostDraftRequestDTO $dto,
        ProjectRepository $projectRepository,
        ScriptRepository $scriptRepository,
        PostDraftRepository $postDraftRepository,
        PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
        PostDraftFileService $postDraftFileService,
        EntityManagerInterface $entityManager,
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

        /** @var PostDraft $postDraft */
        $postDraft = $dto->build();
        $postDraft->setProject($project);
        $postDraft->setScript($script);
        $postDraft->setCreatedBy($user);

        $mediaVersion = new PostDraftMediaVersion();
        $mediaVersion->setPostDraft($postDraft);
        $mediaVersion->setFileCount(count($files));
        $postDraft->addMediaVersion($mediaVersion);

        $postDraftRepository->save($postDraft);
        $postDraftMediaVersionRepository->save($mediaVersion);

        $postDraftFileService->storeUploadedFiles($mediaVersion, $files);

        try {
            $entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            $postDraftFileService->deleteMediaVersion($mediaVersion);
            throw new ScriptAlreadyHasPostDraftException();
        }

        return $this->json(
            data: $postDraft,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_post_drafts_show']],
        );
    }

    #[Route('/{uuid}', name: 'api_post_drafts_update', methods: ['PATCH'], requirements: ['uuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Editor->value)]
    public function update(
        string $uuid,
        UpdatePostDraftRequestDTO $dto,
        PostDraftRepository $postDraftRepository,
        ScriptRepository $scriptRepository,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $postDraft = $postDraftRepository->getByUuid($uuid);

        if ($postDraft === null) {
            throw new MissingPostDraftException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $postDraft->getProject());

        if ($postDraft->getStatus() !== PostDraftStatus::AwaitingReview) {
            throw new PostDraftLockedException();
        }

        if ($dto->hasTitle() && $dto->getTitle() !== null && $dto->getTitle() !== '') {
            $postDraft->setTitle($dto->getTitle());
        }

        if ($dto->hasDescription()) {
            $postDraft->setDescription($dto->getDescription());
        }

        if ($dto->hasNotes()) {
            $postDraft->setNotes($dto->getNotes());
        }

        if ($dto->hasScriptUuid()) {
            $scriptUuid = $dto->getScriptUuid();

            if ($scriptUuid === null) {
                $postDraft->setScript(null);
            } else {
                $script = $scriptRepository->getAccessibleByUuidForUser($scriptUuid, $user);
                $postDraft->setScript($script);
            }
        }

        try {
            $entityManager->flush();
        } catch (UniqueConstraintViolationException) {
            throw new ScriptAlreadyHasPostDraftException();
        }

        return $this->json(
            data: $postDraft,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_drafts_show']],
        );
    }

    #[Route('/{uuid}', name: 'api_post_drafts_delete', methods: ['DELETE'], requirements: ['uuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Editor->value)]
    public function delete(
        string $uuid,
        PostDraftRepository $postDraftRepository,
    ): JsonResponse {
        $postDraft = $postDraftRepository->getByUuid($uuid);

        if ($postDraft === null) {
            throw new MissingPostDraftException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::EDIT, $postDraft->getProject());

        $postDraftRepository->remove($postDraft, true);

        return $this->json(
            data: ["message" => "Post draft deleted successfully"],
            status: Response::HTTP_OK,
        );
    }
}
