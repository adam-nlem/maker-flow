<?php

namespace App\Controller;

use App\Service\Platform\PlatformService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/platforms')]
final class PlatformController extends AbstractController
{
    #[Route('/{platform}/icon', name: 'api_platforms_icon', methods: ['GET'])]
    public function getPlatformIcon(string $platform, PlatformService $platformService): Response
    {
        $iconFile = $platformService->getPlatformIcon($platform);

        return new BinaryFileResponse(
            $iconFile,
            Response::HTTP_OK,
            ['Content-Type' => $iconFile->getMimeType()],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE
        );
    }
}
