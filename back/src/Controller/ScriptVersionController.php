<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptVersion\ListScriptVersionsQueryParamDTO;
use App\DTO\Request\ScriptVersion\UpdateScriptVersionRequestDTO;
use App\Entity\Enum\ScriptVersionStatus;
use App\Entity\User;
use App\Exception\Script\ScriptNotFoundException;
use App\Exception\ScriptVersion\ScriptVersionNotDraftException;
use App\Exception\ScriptVersion\ScriptVersionNotFoundException;
use App\Repository\ScriptRepository;
use App\Repository\ScriptVersionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/script-versions', requirements: ['versionUuid' => Requirement::UUID])]
final class ScriptVersionController extends AbstractController
{
    #[Route('', name: 'api_script_versions_list', methods: ['GET'])]
    public function list(
        ListScriptVersionsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptVersionRepository $scriptVersionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $scriptVersions = $scriptVersionRepository->getByScriptAndUserPaginated(
            $script,
            $user,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit()
        );

        return $this->json(
            data: $scriptVersions,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_versions_list']]
        );
    }

    #[Route('/{versionUuid}', name: 'api_script_versions_show', methods: ['GET'])]
    public function show(
        string $versionUuid,
        ScriptVersionRepository $scriptVersionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $scriptVersion = $scriptVersionRepository->getByUuidAndUser($versionUuid, $user);

        if ($scriptVersion === null) {
            throw new ScriptVersionNotFoundException();
        }

        return $this->json(
            data: $scriptVersion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_versions_show']]
        );
    }

    #[Route('/{versionUuid}', name: 'api_script_versions_update', methods: ['PATCH'])]
    public function update(
        string $versionUuid,
        UpdateScriptVersionRequestDTO $dto,
        ScriptVersionRepository $scriptVersionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $scriptVersion = $scriptVersionRepository->getByUuidAndUser($versionUuid, $user);

        if ($scriptVersion === null) {
            throw new ScriptVersionNotFoundException();
        }

        if ($scriptVersion->getStatus() !== ScriptVersionStatus::Draft) {
            throw new ScriptVersionNotDraftException();
        }

        $scriptVersion->setStatus($dto->getStatus());

        $scriptVersionRepository->save($scriptVersion, true);

        return $this->json(
            data: $scriptVersion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_versions_update']]
        );
    }
}
