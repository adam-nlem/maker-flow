<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptPart\ListScriptPartsQueryParamDTO;
use App\DTO\Request\ScriptPart\CreateScriptPartRequestDTO;
use App\DTO\Request\ScriptPart\ReorderScriptPartsRequestDTO;
use App\DTO\Request\ScriptPart\UpdateScriptPartRequestDTO;
use App\Entity\User;
use App\Exception\Script\ScriptNotFoundException;
use App\Exception\ScriptPart\ScriptPartNotFoundException;
use App\Repository\ScriptPartRepository;
use App\Repository\ScriptRepository;
use App\Service\ScriptPart\ScriptPartService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/script-parts', requirements: ['partUuid' => Requirement::UUID])]
final class ScriptPartController extends AbstractController
{
    #[Route('', name: 'api_script_parts_list', methods: ['GET'])]
    public function list(
        ListScriptPartsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptPartRepository $scriptPartRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $parts = $scriptPartRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $parts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_parts_list']],
        );
    }

    #[Route('', name: 'api_script_parts_create', methods: ['POST'])]
    public function create(
        CreateScriptPartRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptPartService $scriptPartService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $part = $scriptPartService->create(
            $script,
            $user,
            $dto->getContent(),
            $dto->getType(),
            $dto->getPosition(),
        );

        return $this->json(
            data: $part,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_scripts_parts_create']],
        );
    }

    #[Route('/reorder', name: 'api_script_parts_reorder', methods: ['PATCH'])]
    public function reorder(
        ReorderScriptPartsRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptPartRepository $scriptPartRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        foreach ($dto->getOrderedParts() as $index => $orderedPart) {
            $partUuid = $orderedPart['uuid'] ?? null;
            if ($partUuid === null) {
                continue;
            }

            $part = $scriptPartRepository->getByUuidAndUser($partUuid, $user);

            if ($part !== null && $part->getScript() !== null && $part->getScript()->getId() === $script->getId()) {
                $part->setPosition($index);
                $scriptPartRepository->save($part);
            }
        }

        $scriptPartRepository->getEntityManager()->flush();

        return $this->json(data: ['message' => 'Parts reordered successfully'], status: Response::HTTP_OK);
    }

    #[Route('/{partUuid}', name: 'api_script_parts_update', methods: ['PATCH'])]
    public function update(
        string $partUuid,
        UpdateScriptPartRequestDTO $dto,
        ScriptPartRepository $scriptPartRepository,
        ScriptPartService $scriptPartService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $part = $scriptPartRepository->getByUuidAndUser($partUuid, $user);

        if ($part === null) {
            throw new ScriptPartNotFoundException();
        }

        $part = $scriptPartService->update(
            $part,
            $dto->hasContent() ? $dto->getContent() : null,
            $dto->hasType() ? $dto->getType() : null,
            $dto->hasPosition() ? $dto->getPosition() : null,
        );

        return $this->json(
            data: $part,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_parts_update']],
        );
    }

    #[Route('/{partUuid}', name: 'api_script_parts_delete', methods: ['DELETE'])]
    public function delete(
        string $partUuid,
        ScriptPartRepository $scriptPartRepository,
        ScriptPartService $scriptPartService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $part = $scriptPartRepository->getByUuidAndUser($partUuid, $user);

        if ($part === null) {
            throw new ScriptPartNotFoundException();
        }

        $scriptPartService->delete($part);

        return $this->json(data: ['message' => 'Script part deleted successfully'], status: Response::HTTP_OK);
    }
}
