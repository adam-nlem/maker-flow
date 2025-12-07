<?php

namespace App\Controller;

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
    #[Route('/{moduleUuid}/icon', name: 'api_module_get_icon')]
    public function getIcon(string $moduleUuid, ModuleRepository $moduleRepository, ModuleService $moduleService)
    {
        $module = $moduleRepository->getByUuid($moduleUuid);

        if ($module === null) {
            return $this->json(data: ["message" => "No module with this uuid has been found"], status: Response::HTTP_NOT_FOUND);
        }

        $iconFile = $moduleService->getModuleIcon($moduleUuid);

        return new BinaryFileResponse(
            $iconFile,
            Response::HTTP_OK,
            ['Content-Type' => $iconFile->getMimeType(),],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE
        );
    }
}
