<?php

namespace App\Controller;

use App\DTO\QueryParam\PostDraft\StreamFileQueryParamDTO;
use App\DTO\QueryParam\PostDraft\StreamHlsQueryParamDTO;
use App\DTO\Request\PostDraft\RequestChangesOnPostDraftMediaVersionRequestDTO;
use App\Entity\Enum\PostDraftStatus;
use App\Entity\Enum\UserRole;
use App\Entity\PostDraftMediaVersionComment;
use App\Entity\User;
use App\Exception\PostDraft\MissingPostDraftException;
use App\Exception\PostDraft\PostDraftMediaVersionNotAwaitingReviewException;
use App\Exception\PostDraft\PostDraftMediaVersionNotAwaitingReviewOrApprovedException;
use App\Exception\PostDraft\PostDraftMediaVersionNotLatestException;
use App\Repository\PostDraftMediaVersionCommentRepository;
use App\Repository\PostDraftMediaVersionRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\PostDraft\PostDraftFileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/post-draft-media-versions')]
final class PostDraftMediaVersionController extends AbstractController
{
    private const HLS_CONTENT_TYPES = [
        'm3u8' => 'application/vnd.apple.mpegurl',
        'ts' => 'video/mp2t',
    ];

    #[Route('/files', name: 'api_post_draft_media_versions_stream_file', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function streamFile(
        StreamFileQueryParamDTO $queryParamDto,
        PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
        PostDraftFileService $postDraftFileService,
    ): Response {
        $mediaVersion = $postDraftMediaVersionRepository->getByUuid($queryParamDto->getMediaVersionUuid());

        if ($mediaVersion === null) {
            throw new MissingPostDraftException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $mediaVersion->getPostDraft()->getProject());

        $file = $postDraftFileService->getFileByIndex($mediaVersion, $queryParamDto->getIndex());

        if ($file === null) {
            throw new MissingPostDraftException();
        }

        return new BinaryFileResponse(
            $file,
            Response::HTTP_OK,
            ['Content-Type' => $file->getMimeType() ?? 'application/octet-stream'],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE,
        );
    }

    #[Route('/stream', name: 'api_post_draft_media_versions_stream_hls', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function streamHls(
        StreamHlsQueryParamDTO $queryParamDto,
        PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
        PostDraftFileService $postDraftFileService,
    ): Response {
        $mediaVersion = $postDraftMediaVersionRepository->getByUuid($queryParamDto->getMediaVersionUuid());

        if ($mediaVersion === null) {
            throw new MissingPostDraftException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $mediaVersion->getPostDraft()->getProject());

        $path = $queryParamDto->getPath();
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if (!isset(self::HLS_CONTENT_TYPES[$extension])) {
            throw new MissingPostDraftException();
        }

        $file = $postDraftFileService->getStreamFile($mediaVersion, $path);

        if ($file === null) {
            throw new MissingPostDraftException();
        }

        return new BinaryFileResponse(
            $file,
            Response::HTTP_OK,
            ['Content-Type' => self::HLS_CONTENT_TYPES[$extension]],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE,
        );
    }

    #[Route('/{mediaVersionUuid}/approve', name: 'api_post_draft_media_versions_approve', methods: ['POST'], requirements: ['mediaVersionUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Client->value)]
    public function approve(
        string $mediaVersionUuid,
        PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
    ): JsonResponse {
        $mediaVersion = $postDraftMediaVersionRepository->getByUuid($mediaVersionUuid);

        if ($mediaVersion === null) {
            throw new MissingPostDraftException();
        }

        $postDraft = $mediaVersion->getPostDraft();

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $postDraft->getProject());

        if ($postDraft->getLatestMediaVersion() !== $mediaVersion) {
            throw new PostDraftMediaVersionNotLatestException();
        }

        if ($mediaVersion->getStatus() !== PostDraftStatus::AwaitingReview) {
            throw new PostDraftMediaVersionNotAwaitingReviewException();
        }

        $mediaVersion->setStatus(PostDraftStatus::Approved);

        $postDraftMediaVersionRepository->save($mediaVersion, true);

        return $this->json(
            data: $postDraft,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_draft_media_versions_approve']],
        );
    }

    #[Route('/{mediaVersionUuid}/request-changes', name: 'api_post_draft_media_versions_request_changes', methods: ['POST'], requirements: ['mediaVersionUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Client->value)]
    public function requestChanges(
        string $mediaVersionUuid,
        RequestChangesOnPostDraftMediaVersionRequestDTO $dto,
        PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
        PostDraftMediaVersionCommentRepository $postDraftMediaVersionCommentRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $mediaVersion = $postDraftMediaVersionRepository->getByUuid($mediaVersionUuid);

        if ($mediaVersion === null) {
            throw new MissingPostDraftException();
        }

        $postDraft = $mediaVersion->getPostDraft();

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $postDraft->getProject());

        if ($postDraft->getLatestMediaVersion() !== $mediaVersion) {
            throw new PostDraftMediaVersionNotLatestException();
        }

        if (!in_array($mediaVersion->getStatus(), [PostDraftStatus::AwaitingReview, PostDraftStatus::Approved], true)) {
            throw new PostDraftMediaVersionNotAwaitingReviewOrApprovedException();
        }


        $comment = new PostDraftMediaVersionComment();
        $comment->setMediaVersion($mediaVersion);
        $comment->setAuthor($user);
        $comment->setBody($dto->getComment());
        $mediaVersion->addComment($comment);

        
        $mediaVersion->setStatus(PostDraftStatus::ChangesRequested);
        
        $postDraftMediaVersionCommentRepository->save($comment, true);

        return $this->json(
            data: $postDraft,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_draft_media_versions_request_changes']],
        );
    }
}
