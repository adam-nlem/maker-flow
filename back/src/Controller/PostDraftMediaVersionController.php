<?php

namespace App\Controller;

use App\DTO\QueryParam\PostDraft\StreamFileQueryParamDTO;
use App\DTO\QueryParam\PostDraft\StreamHlsQueryParamDTO;
use App\Entity\Enum\UserRole;
use App\Exception\PostDraft\MissingPostDraftException;
use App\Repository\PostDraftMediaVersionRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\PostDraft\PostDraftFileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/post-draft-media-versions')]
final class PostDraftMediaVersionController extends AbstractController
{
    private const HLS_CONTENT_TYPES = [
        'm3u8' => 'application/vnd.apple.mpegurl',
        'ts' => 'video/mp2t',
    ];

    #[Route('/files', name: 'api_post_draft_media_versions_stream_file', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
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
    #[IsGranted(UserRole::Viewer->value)]
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
}
