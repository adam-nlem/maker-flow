<?php

namespace App\Controller;

use App\DTO\QueryParam\Script\ListCalendarScriptsQueryParamDTO;
use App\DTO\QueryParam\Script\ListScriptsQueryParamDTO;
use App\DTO\Response\Script\ListScriptsGroupedByDayResponseDTO;
use App\DTO\Request\Script\CreateScriptRequestDTO;
use App\DTO\Request\Script\UpdateScriptRequestDTO;
use App\Entity\Script;
use App\Entity\User;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\Script\ScriptNotFoundException;
use App\Exception\Script\ScriptLimitReachedException;
use App\Repository\PostGroupRepository;
use App\Repository\ProjectRepository;
use App\Repository\ScriptRepository;
use App\Repository\SubscriptionRepository;
use App\Service\Stripe\StripePlanService;
use App\Repository\ScriptTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts', requirements: ['scriptUuid' => Requirement::UUID])]
final class ScriptController extends AbstractController
{
    #[Route('', name: 'api_scripts_list', methods: ['GET'])]
    public function list(
        ListScriptsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $scripts = $scriptRepository->getByProjectAndUserPaginated($project, $user, $queryParamDto->getPage(), $queryParamDto->getLimit(), $queryParamDto->getStatus());

        return $this->json(
            data: $scripts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_list']]
        );
    }

    #[Route('/calendar', name: 'api_scripts_calendar', methods: ['GET'])]
    public function calendar(
        ListCalendarScriptsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $scripts = $scriptRepository->getByProjectAndUserAndMonth($project, $user, $queryParamDto->getYear(), $queryParamDto->getMonth());

        $grouped = [];
        foreach ($scripts as $script) {
            $dateKey = $script->getPublishedAt()->format('Y-m-d');
            $grouped[$dateKey][] = $script;
        }

        $result = array_map(
            fn(string $date, array $dayScripts) => (new ListScriptsGroupedByDayResponseDTO($date, $dayScripts))->getData(),
            array_keys($grouped),
            array_values($grouped),
        );

        return $this->json(
            data: $result,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_calendar']]
        );
    }

    #[Route('', name: 'api_scripts_create', methods: ['POST'])]
    public function create(
        CreateScriptRequestDTO $dto,
        ProjectRepository $projectRepository,
        ScriptRepository $scriptRepository,
        PostGroupRepository $postGroupRepository,
        ScriptTagRepository $scriptTagRepository,
        SubscriptionRepository $subscriptionRepository,
        StripePlanService $stripePlanService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $plan = $subscriptionRepository->getLatestActiveByUser($user)?->getPlan();
        $maxScripts = $plan !== null ? $stripePlanService->getPlanConfigFromSubscription($plan)?->getMaxScriptsPerProject() : 1;

        if ($maxScripts !== null && $scriptRepository->countByProjectAndUser($project, $user) >= $maxScripts) {
            throw new ScriptLimitReachedException();
        }

        /** @var Script $script */
        $script = $dto->build();

        $script
            ->setUser($user)
            ->setProject($project);

        if ($dto->getPostGroupUuid() !== null) {
            $postGroup = $postGroupRepository->getByUuidAndUser($dto->getPostGroupUuid(), $user);
            if ($postGroup !== null) {
                $script->setPostGroup($postGroup);
            }
        }

        if ($dto->getTagUuids() !== null && count($dto->getTagUuids()) > 0) {
            $tags = $scriptTagRepository->getByUserAndWithUuidIn($user, $dto->getTagUuids());
            foreach ($tags as $tag) {
                $script->addTag($tag);
            }
        }

        $scriptRepository->save($script, true);

        return $this->json(
            data: $script,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_create']]
        );
    }

    #[Route('/{scriptUuid}', name: 'api_scripts_show', methods: ['GET'])]
    public function show(
        string $scriptUuid,
        ScriptRepository $scriptRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        return $this->json(
            data: $script,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_show']]
        );
    }

    #[Route('/{scriptUuid}', name: 'api_scripts_update', methods: ['PATCH'])]
    public function update(
        string $scriptUuid,
        UpdateScriptRequestDTO $dto,
        ScriptRepository $scriptRepository,
        PostGroupRepository $postGroupRepository,
        ScriptTagRepository $scriptTagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $script->getTitle()) {
            $script->setTitle($dto->getTitle());
        }

        if ($dto->hasPublishedAt()) {
            $script->setPublishedAt($dto->getPublishedAt());
        }

        if ($dto->hasPostGroupUuid()) {
            if ($dto->getPostGroupUuid() === null) {
                $script->setPostGroup(null);
            } else {
                $postGroup = $postGroupRepository->getByUuidAndUser($dto->getPostGroupUuid(), $user);
                if ($postGroup !== null) {
                    $script->setPostGroup($postGroup);
                }
            }
        }

        if ($dto->getTagUuids() !== null) {
            foreach ($script->getTags()->toArray() as $existingTag) {
                $script->removeTag($existingTag);
            }

            if (count($dto->getTagUuids()) > 0) {
                $tags = $scriptTagRepository->getByUserAndWithUuidIn($user, $dto->getTagUuids());
                foreach ($tags as $tag) {
                    $script->addTag($tag);
                }
            }
        }

        if ($dto->hasPlatforms()) {
            $script->setPlatforms($dto->getPlatforms());
        }

        if ($dto->hasStatus()) {
            $script->setStatus($dto->getStatus());
        }

        $scriptRepository->save($script, true);

        return $this->json(
            data: $script,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_update']]
        );
    }

    #[Route('/{scriptUuid}', name: 'api_scripts_delete', methods: ['DELETE'])]
    public function delete(
        string $scriptUuid,
        ScriptRepository $scriptRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $scriptRepository->remove($script, true);

        return $this->json(data: ["message" => "Script deleted successfully"], status: Response::HTTP_OK);
    }
}
