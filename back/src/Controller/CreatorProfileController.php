<?php

namespace App\Controller;

use App\DTO\QueryParam\CreatorProfile\ShowCreatorProfileQueryParamDTO;
use App\DTO\Request\CreatorProfile\CreateOrUpdateCreatorProfileRequestDTO;
use App\Entity\CreatorProfile;
use App\Entity\User;
use App\Exception\CreatorProfile\CreatorProfileNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Repository\CreatorProfileRepository;
use App\Repository\ProjectRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/creator-profiles')]
final class CreatorProfileController extends AbstractController
{
    #[Route('', name: 'api_creator_profiles_show', methods: ['GET'])]
    public function show(
        ShowCreatorProfileQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        CreatorProfileRepository $creatorProfileRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $creatorProfile = $creatorProfileRepository->getByProjectAndUser($project, $user);

        if ($creatorProfile === null) {
            throw new CreatorProfileNotFoundException();
        }

        return $this->json(
            data: $creatorProfile,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_creator_profiles_show']]
        );
    }

    #[Route('', name: 'api_creator_profiles_create_or_update', methods: ['POST'])]
    public function createOrUpdate(
        CreateOrUpdateCreatorProfileRequestDTO $dto,
        ProjectRepository $projectRepository,
        CreatorProfileRepository $creatorProfileRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $existingProfile = $creatorProfileRepository->getByProjectAndUser($project, $user);
        $isNew = $existingProfile === null;

        if ($isNew) {
            /** @var CreatorProfile $creatorProfile */
            $creatorProfile = $dto->build();

            $creatorProfile
                ->setUser($user)
                ->setProject($project);
        } else {
            $creatorProfile = $existingProfile;
            $creatorProfile
                ->setNiche($dto->getNiche())
                ->setTargetAudience($dto->getTargetAudience())
                ->setTones($dto->getTones())
                ->setSignaturePhrases($dto->getSignaturePhrases())
                ->setNeverList($dto->getNeverList())
                ->setStyleSample($dto->getStyleSample());
        }

        $creatorProfileRepository->save($creatorProfile, true);

        return $this->json(
            data: $creatorProfile,
            status: $isNew ? Response::HTTP_CREATED : Response::HTTP_OK,
            context: ['groups' => [$isNew ? 'api_creator_profiles_create' : 'api_creator_profiles_update']]
        );
    }
}
