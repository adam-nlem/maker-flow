<?php

namespace App\Controller;

use App\DTO\Request\PostDraft\CreatePostDraftMediaVersionCommentRequestDTO;
use App\Entity\Enum\UserRole;
use App\Entity\PostDraftMediaVersionComment;
use App\Entity\User;
use App\Exception\PostDraft\MissingPostDraftException;
use App\Exception\PostDraft\PostDraftMediaVersionNotLatestException;
use App\Repository\PostDraftMediaVersionCommentRepository;
use App\Repository\PostDraftMediaVersionRepository;
use App\Security\Voter\ProjectVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/post-draft-media-version-comments')]
final class PostDraftMediaVersionCommentController extends AbstractController
{
    #[Route('', name: 'api_post_draft_media_version_comments_create', methods: ['POST'])]
    #[IsGranted(UserRole::User->value)]
    public function create(
        CreatePostDraftMediaVersionCommentRequestDTO $dto,
        PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
        PostDraftMediaVersionCommentRepository $postDraftMediaVersionCommentRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $mediaVersion = $postDraftMediaVersionRepository->getByUuid($dto->getMediaVersionUuid());

        if ($mediaVersion === null) {
            throw new MissingPostDraftException();
        }

        $postDraft = $mediaVersion->getPostDraft();

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $postDraft->getProject());

        if ($postDraft->getLatestMediaVersion() !== $mediaVersion) {
            throw new PostDraftMediaVersionNotLatestException();
        }

        /** @var PostDraftMediaVersionComment $comment */
        $comment = $dto->build();
        $comment->setAuthor($user);
        $mediaVersion->addComment($comment);

        $postDraftMediaVersionCommentRepository->save($comment, true);

        return $this->json(
            data: $postDraft,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_draft_media_version_comments_create']],
        );
    }
}
