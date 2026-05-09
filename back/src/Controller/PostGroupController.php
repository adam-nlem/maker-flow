<?php

namespace App\Controller;

use App\DTO\QueryParam\PostGroup\ListPostGroupsQueryParamDTO;
use App\DTO\QueryParam\PostGroup\RankPostGroupsQueryParamDTO;
use App\DTO\Request\PostGroup\CreatePostGroupRequestDTO;
use App\DTO\Request\PostGroup\UpdatePostGroupRequestDTO;
use App\Entity\PostGroup;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Post\PostGroupNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\Stripe\ActiveSubscriptionRequiredException;
use App\Repository\AgencyRepository;
use App\Repository\PostGroupRepository;
use App\Repository\PostRepository;
use App\Repository\ProjectRepository;
use App\Repository\ScriptRepository;
use App\Repository\SubscriptionRepository;
use App\Service\PostGroup\PostGroupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/post-groups', requirements: ['postGroupUuid' => Requirement::UUID])]
final class PostGroupController extends AbstractController
{
    public function __construct(private PostGroupService $service) {}

    #[Route('', name: 'api_post_groups_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(
        ListPostGroupsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $result = $this->service->getPostGroupListItems(
            project: $project,
            searchTerm: $queryParamDto->getSearchTerm(),
            page: $queryParamDto->getPage(),
            limit: $queryParamDto->getLimit()
        );

        return $this->json(
            data: $result,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_list']]
        );
    }

    #[Route('/{postGroupUuid}', name: 'api_post_groups_show', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function show(string $postGroupUuid, PostGroupRepository $postGroupRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $postGroup = $postGroupRepository->getAccessibleByUuidForUser($postGroupUuid, $user);

        if ($postGroup === null) {
            throw new PostGroupNotFoundException();
        }

        return $this->json(
            data: $this->service->getPostGroupDetail($postGroup),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_show']],
        );
    }

    #[Route('/rank', name: 'api_post_groups_rank', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function rank(
        RankPostGroupsQueryParamDTO $queryParamDto,
        AgencyRepository $agencyRepository,
        ProjectRepository $projectRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $agency = $agencyRepository->getByProject($project);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        if ($subscriptionRepository->getLatestActiveByAgency($agency) === null) {
            throw new ActiveSubscriptionRequiredException();
        }

        $result = $this->service->getRankedPostGroups($project, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(
            data: $result,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_rank']],
        );
    }

    #[Route('', name: 'api_post_groups_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreatePostGroupRequestDTO $dto,
        ProjectRepository $projectRepository,
        PostGroupRepository $postGroupRepository,
        PostRepository $postRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        /** @var PostGroup $postGroup */
        $postGroup = $dto->build();

        $postGroup
            ->setUser($user)
            ->setProject($project);

        $posts = $postRepository->getAccessibleByUuidsForUser($dto->getPostUuids(), $user);

        foreach ($posts as $post) {
            $post->setPostGroup($postGroup);
        }

        $postGroupRepository->save($postGroup, true);

        return $this->json(
            data: $postGroup,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_create']]
        );
    }

    #[Route('/{postGroupUuid}', name: 'api_post_groups_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $postGroupUuid,
        UpdatePostGroupRequestDTO $dto,
        PostGroupRepository $postGroupRepository,
        PostRepository $postRepository,
        ScriptRepository $scriptRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $postGroup = $postGroupRepository->getAccessibleByUuidForUser($postGroupUuid, $user);

        if ($postGroup === null) {
            throw new PostGroupNotFoundException();
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $postGroup->getTitle()) {
            $postGroup->setTitle($dto->getTitle());
        }

        if ($dto->getAddPostUuids() !== null) {
            $postsToAdd = $postRepository->getAccessibleByUuidsForUser($dto->getAddPostUuids(), $user);

            foreach ($postsToAdd as $post) {
                $post->setPostGroup($postGroup);
            }
        }

        if ($dto->getRemovePostUuids() !== null) {
            $postsToRemove = $postRepository->getAccessibleByUuidsForUser($dto->getRemovePostUuids(), $user);

            foreach ($postsToRemove as $post) {
                $post->setPostGroup(null);
            }
        }

        if ($dto->hasScriptUuid()) {
            $currentScript = $postGroup->getScript();

            if ($dto->getScriptUuid() === null) {
                if ($currentScript !== null) {
                    $currentScript->setPostGroup(null);
                    $scriptRepository->save($currentScript);
                }
            } else {
                $script = $scriptRepository->getAccessibleByUuidForUser($dto->getScriptUuid(), $user);

                if ($script !== null) {
                    if ($currentScript !== null && $currentScript !== $script) {
                        $currentScript->setPostGroup(null);
                        $scriptRepository->save($currentScript);
                    }

                    $script->setPostGroup($postGroup);
                    $scriptRepository->save($script);
                }
            }
        }

        $postGroupRepository->save($postGroup, true);

        return $this->json(
            data: $postGroup,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_update']]
        );
    }

    #[Route('/{postGroupUuid}', name: 'api_post_groups_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_EDITOR')]
    public function delete(
        string $postGroupUuid,
        PostGroupRepository $postGroupRepository,
        PostRepository $postRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $postGroup = $postGroupRepository->getAccessibleByUuidForUser($postGroupUuid, $user);

        if ($postGroup === null) {
            throw new PostGroupNotFoundException();
        }

        $postRepository->unlinkPostsByPostGroup($postGroup);
        $postGroupRepository->remove($postGroup, true);

        return $this->json(data: ["message" => "Post group deleted successfully"], status: Response::HTTP_OK);
    }
}
