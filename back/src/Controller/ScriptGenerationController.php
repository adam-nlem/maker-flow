<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptGeneration\ListScriptGenerationQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptGeneration\GenerateScriptRequestDTO;
use App\Entity\ScriptGeneration;
use App\Entity\User;
use App\Message\GenerateScriptMessage;
use App\Repository\ScriptGenerationRepository;
use App\Repository\ScriptRepository;
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
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptGeneration $generation */
            $generation = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

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

        $generations = $generationRepository->getByScriptAndUser($script, $user);

        return $this->json(
            data: $generations,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_generations_show']]
        );
    }
}
