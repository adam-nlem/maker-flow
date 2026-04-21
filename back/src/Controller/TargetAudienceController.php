<?php

namespace App\Controller;

use App\DTO\QueryParam\TargetAudience\ListTargetAudiencesQueryParamDTO;
use App\DTO\Request\TargetAudience\CreateTargetAudienceRequestDTO;
use App\Entity\CreatorProfile;
use App\Entity\TargetAudience;
use App\Entity\User;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\TargetAudience\TargetAudienceNotFoundException;
use App\Repository\CreatorProfileRepository;
use App\Repository\ProjectRepository;
use App\Repository\TargetAudienceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/target-audiences', requirements: ['targetAudienceUuid' => Requirement::UUID])]
final class TargetAudienceController extends AbstractController
{
    #[Route('', name: 'api_target_audiences_create', methods: ['POST'])]
    public function create(
        CreateTargetAudienceRequestDTO $dto,
        ProjectRepository $projectRepository,
        CreatorProfileRepository $creatorProfileRepository,
        TargetAudienceRepository $targetAudienceRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $creatorProfile = $creatorProfileRepository->getByProjectAndUser($project, $user);

        if ($creatorProfile === null) {
            $creatorProfile = new CreatorProfile();
            $creatorProfile
                ->setUser($user)
                ->setProject($project);

            $creatorProfileRepository->save($creatorProfile, true);
        }

        /** @var TargetAudience $targetAudience */
        $targetAudience = $dto->build();

        $targetAudience
            ->setCreatorProfile($creatorProfile)
            ->setUser($user);

        $targetAudienceRepository->save($targetAudience, true);

        return $this->json(
            data: $targetAudience,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_target_audiences_create']]
        );
    }

    #[Route('', name: 'api_target_audiences_list', methods: ['GET'])]
    public function list(
        ListTargetAudiencesQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        CreatorProfileRepository $creatorProfileRepository,
        TargetAudienceRepository $targetAudienceRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $creatorProfile = $creatorProfileRepository->getByProjectAndUser($project, $user);

        if ($creatorProfile === null) {
            return $this->json(
                data: [],
                status: Response::HTTP_OK,
                context: ['groups' => ['api_target_audiences_list']]
            );
        }

        $targetAudiences = $targetAudienceRepository->getByCreatorProfile($creatorProfile);

        return $this->json(
            data: $targetAudiences,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_target_audiences_list']]
        );
    }

    #[Route('/{targetAudienceUuid}', name: 'api_target_audiences_delete', methods: ['DELETE'])]
    public function delete(
        string $targetAudienceUuid,
        TargetAudienceRepository $targetAudienceRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $targetAudience = $targetAudienceRepository->getByUuidAndUser($targetAudienceUuid, $user);

        if ($targetAudience === null) {
            throw new TargetAudienceNotFoundException();
        }

        $targetAudienceRepository->remove($targetAudience, true);

        return $this->json(
            data: ["message" => "Target audience deleted successfully"],
            status: Response::HTTP_OK
        );
    }
}
