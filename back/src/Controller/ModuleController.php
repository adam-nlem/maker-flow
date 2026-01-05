<?php

namespace App\Controller;

use App\DTO\QueryParam\Module\ListModulesQueryParamDTO;
use App\Repository\ModuleRepository;
use App\Service\Module\ModuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/modules')]
final class ModuleController extends AbstractController
{

    #[Route('', name: 'api_modules_list', methods: ['GET'])]
    public function list(
        ListModulesQueryParamDTO $queryParamDto,
        ModuleRepository $moduleRepository,
    ) {
        $modules = $moduleRepository->getAllPaginated($queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(data: $modules, status: Response::HTTP_OK, context: ['groups' => ['api_modules_list']]);
    }

    #[Route('/{moduleIdentifier}/icon', name: 'api_modules_get_icon', methods: ['GET'])]
    public function getIcon(string $moduleIdentifier, ModuleRepository $moduleRepository, ModuleService $moduleService)
    {
        $module = $moduleRepository->getByModuleIdentifier($moduleIdentifier);

        if ($module === null) {
            return $this->json(data: ["message" => "No module with this identifier has been found"], status: Response::HTTP_NOT_FOUND);
        }

        $iconFile = $moduleService->getModuleIcon($moduleIdentifier);

        return new BinaryFileResponse(
            $iconFile,
            Response::HTTP_OK,
            ['Content-Type' => $iconFile->getMimeType(),],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE
        );
    }
}
