<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptGeneration\ListScriptGenerationQueryParamDTO;
use App\DTO\Request\ScriptGeneration\GenerateScriptRequestDTO;
use App\DTO\Request\ScriptGeneration\UpdateScriptGenerationRequestDTO;
use App\Entity\Enum\ScriptGenerationStatus;
use App\Entity\ScriptGeneration;
use App\Entity\User;
use App\Message\GenerateScriptMessage;
use App\Repository\ScriptGenerationRepository;
use App\Repository\ScriptRepository;
use App\Service\Credit\CreditService;
use App\Service\ScriptGeneration\ScriptGenerationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/script-generations', requirements: ['generationUuid' => Requirement::UUID])]
final class ScriptGenerationController extends AbstractController
{
    #[Route('', name: 'api_script_generations_create', methods: ['POST'])]
    public function create(
        GenerateScriptRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptGenerationRepository $generationRepository,
        MessageBusInterface $messageBus,
        CreditService $creditService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($generationRepository->hasActiveGeneration($user)) {
            return $this->json(data: ["message" => "You already have a processing generation. Please wait until it is completed."], status: Response::HTTP_CONFLICT);
        }

        if ($creditService->getTotalCredits($user) < 1) {
            return $this->json(data: ["message" => "You don't have enough credits to generate a script."], status: Response::HTTP_PAYMENT_REQUIRED);
        }

        /** @var ScriptGeneration $generation */
        $generation = $dto->build();

        $generation
            ->setUser($user)
            ->setScript($script);

        $generationRepository->save($generation, true);

        $messageBus->dispatch(new GenerateScriptMessage($generation->getId()));

        return $this->json(
            data: $generation,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_script_generations_create']]
        );
    }

    #[Route('/{generationUuid}', name: 'api_script_generations_show', methods: ['GET'])]
    public function show(
        string $generationUuid,
        ScriptGenerationRepository $generationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $generation = $generationRepository->getByUuidAndUser($generationUuid, $user);

        if ($generation === null) {
            return $this->json(data: ["message" => "You don't have any generation with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            data: $generation,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_generations_show']]
        );
    }

    #[Route('', name: 'api_script_generations_list', methods: ['GET'])]
    public function list(
        ListScriptGenerationQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptGenerationRepository $generationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $generations = $generationRepository->getByScriptAndUserPaginated($script, $user, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(
            data: $generations,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_generations_list']]
        );
    }

    #[Route('/{generationUuid}', name: 'api_script_generations_update', methods: ['PATCH'])]
    public function update(
        string $generationUuid,
        UpdateScriptGenerationRequestDTO $dto,
        ScriptGenerationRepository $generationRepository,
        MessageBusInterface $messageBus,
        CreditService $creditService,
        ScriptGenerationService $scriptGenerationService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $generation = $generationRepository->getByUuidAndUser($generationUuid, $user);

        if ($generation === null) {
            return $this->json(data: ["message" => "You don't have any generation with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($generationRepository->hasActiveGenerationExcluding($user, $generation)) {
            return $this->json(data: ["message" => "You already have a processing generation. Please wait until it is completed."], status: Response::HTTP_CONFLICT);
        }

        if ($creditService->getTotalCredits($user) < 1) {
            return $this->json(data: ["message" => "You don't have enough credits to generate a script."], status: Response::HTTP_PAYMENT_REQUIRED);
        }

        $scriptGenerationService->deletePartsByGeneration($generation);

        $generation
            ->setTopic($dto->getTopic())
            ->setGoal($dto->getGoal())
            ->setKeyPoints($dto->getKeyPoints())
            ->setOpeningStyle($dto->getOpeningStyle())
            ->setDuration($dto->getDuration())
            ->setCallToAction($dto->getCallToAction())
            ->setExtraContext($dto->getExtraContext())
            ->setActiveSkills($dto->getActiveSkills())
            ->setSkillInputs($dto->getSkillInputs())
            ->setAiModel($dto->getAiModel())
            ->setStatus(ScriptGenerationStatus::Pending)
            ->setCompletedAt(null)
            ->setErrorMessage(null)
            ->setAssembledPrompt(null);

        $generationRepository->save($generation, true);

        $messageBus->dispatch(new GenerateScriptMessage($generation->getId()));

        return $this->json(
            data: $generation,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_generations_update']]
        );
    }

    #[Route('/{generationUuid}', name: 'api_script_generations_delete', methods: ['DELETE'])]
    public function delete(
        string $generationUuid,
        ScriptGenerationRepository $generationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $generation = $generationRepository->getByUuidAndUser($generationUuid, $user);

        if ($generation === null) {
            return $this->json(data: ["message" => "You don't have any generation with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if (in_array($generation->getStatus(), [ScriptGenerationStatus::Pending, ScriptGenerationStatus::Processing])) {
            return $this->json(data: ["message" => "You cannot delete an active generation."], status: Response::HTTP_CONFLICT);
        }

        $generationRepository->remove($generation, true);

        return $this->json(data: null, status: Response::HTTP_NO_CONTENT);
    }
}
