<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptHook\CreateScriptHookRequestDTO;
use App\DTO\Request\ScriptHook\UpdateScriptHookRequestDTO;
use App\Entity\ScriptHook;
use App\Entity\User;
use App\Repository\HookTemplateRepository;
use App\Repository\ScriptGenerationRepository;
use App\Repository\ScriptHookRepository;
use App\Repository\ScriptRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts/hooks', requirements: ['hookUuid' => Requirement::UUID])]
final class ScriptHookController extends AbstractController
{
    #[Route('', name: 'api_scripts_hooks_create', methods: ['POST'])]
    public function create(
        CreateScriptHookRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptGenerationRepository $generationRepository,
        ScriptHookRepository $hookRepository,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptHook $hook */
            $hook = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $hook
            ->setUser($user)
            ->setScript($script);

        $generation = null;
        if ($dto->getGenerationUuid() !== null) {
            $generation = $generationRepository->getByUuidAndUser($dto->getGenerationUuid(), $user);
            if ($generation === null) {
                return $this->json(data: ["message" => "You don't have any generation with this uuid"], status: Response::HTTP_NOT_FOUND);
            }
            $hook->setScriptGeneration($generation);
        }

        if ($hookRepository->existsByScriptUserAndGeneration($script, $user, $generation)) {
            return $this->json(data: ["message" => "A hook already exists for this script and generation"], status: Response::HTTP_BAD_REQUEST);
        }

        if ($dto->getHookTemplateUuid() !== null) {
            $hookTemplate = $hookTemplateRepository->getByUuid($dto->getHookTemplateUuid());
            if ($hookTemplate !== null) {
                $hook->setHookTemplate($hookTemplate);
            }
        }

        $hook->setPosition(0);

        $hookRepository->save($hook, true);

        return $this->json(
            data: $hook,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_hooks_create']]
        );
    }

    #[Route('/{hookUuid}', name: 'api_scripts_hooks_update', methods: ['PATCH'])]
    public function update(
        string $hookUuid,
        UpdateScriptHookRequestDTO $dto,
        ScriptHookRepository $hookRepository,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $hook = $hookRepository->getByUuidAndUser($hookUuid, $user);

        if ($hook === null) {
            return $this->json(data: ["message" => "You don't have any hook with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $hook->getContent()) {
            $hook->setContent($dto->getContent());
        }

        if ($dto->hasHookTemplateUuid()) {
            if ($dto->getHookTemplateUuid() !== null) {
                $hookTemplate = $hookTemplateRepository->getByUuid($dto->getHookTemplateUuid());
                if ($hookTemplate !== null) {
                    $hook->setHookTemplate($hookTemplate);
                }
            } else {
                $hook->setHookTemplate(null);
            }
        }

        $hookRepository->save($hook, true);

        return $this->json(
            data: $hook,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_hooks_update']]
        );
    }

    #[Route('/{hookUuid}', name: 'api_scripts_hooks_delete', methods: ['DELETE'])]
    public function delete(string $hookUuid, ScriptHookRepository $hookRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $hook = $hookRepository->getByUuidAndUser($hookUuid, $user);

        if ($hook === null) {
            return $this->json(data: ["message" => "You don't have any hook with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $hookRepository->remove($hook, true);

        return $this->json(data: ["message" => "Hook deleted successfully"], status: Response::HTTP_OK);
    }
}
