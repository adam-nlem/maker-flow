<?php

namespace App\Controller;

use App\DTO\Request\UserModule\CreateUserModuleRequestDTO;
use App\Entity\Enum\ModuleSize;
use App\Entity\User;
use App\Entity\UserModule;
use App\Repository\ModuleRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserModuleRepository;
use App\Service\Module\ModuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/user-modules')]
final class UserModuleController extends AbstractController
{
    #[Route('', name: 'api_user_modules_create', methods: ['POST'])]
    public function create(
        CreateUserModuleRequestDTO $dto,
        ModuleRepository $moduleRepository,
        ProjectRepository $projectRepository,
        UserModuleRepository $userModuleRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $module = $moduleRepository->getByUuid($dto->getModuleUuid());

        if ($module === null) {
            return $this->json(data: ["message" => "No module with this uuid has been found"], status: Response::HTTP_NOT_FOUND);
        }

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $userModule = $userModuleRepository->getByUserAndProjectAndModule($user, $project, $module);

        if ($userModule !== null) {
            return $this->json(data: ["message" => "You already have an instance of this module for this project"], status: Response::HTTP_CONFLICT);
        }

        $userModule = (new UserModule)->setUser($user)
            ->setModule($module)
            ->setProject($project)
            //TODO: impelement these values
            ->setXIndex(1)
            ->setYIndex(1)
            ->setSize(ModuleSize::Large);

        $userModuleRepository->save($userModule, true);

        return $this->json(
            data: $userModule,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_user_modules_create']]
        );
    }
}
