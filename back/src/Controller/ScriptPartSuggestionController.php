<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptPartSuggestion\ListScriptPartSuggestionsQueryParamDTO;
use App\Entity\User;
use App\Exception\Script\ScriptNotFoundException;
use App\Exception\ScriptPartSuggestion\ScriptPartSuggestionNotFoundException;
use App\Repository\ScriptPartSuggestionRepository;
use App\Repository\ScriptRepository;
use App\Service\ScriptPartSuggestion\ScriptPartSuggestionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/script-part-suggestions', requirements: ['suggestionUuid' => Requirement::UUID])]
final class ScriptPartSuggestionController extends AbstractController
{
    #[Route('', name: 'api_script_part_suggestions_list', methods: ['GET'])]
    public function list(
        ListScriptPartSuggestionsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $suggestions = $scriptPartSuggestionRepository->getByScriptAndUser(
            $script,
            $user,
            $queryParamDto->getStatus(),
        );

        return $this->json(
            data: $suggestions,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_part_suggestions_list']],
        );
    }

    #[Route('/{suggestionUuid}/accept', name: 'api_script_part_suggestions_accept', methods: ['POST'])]
    public function accept(
        string $suggestionUuid,
        ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
        ScriptPartSuggestionService $scriptPartSuggestionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $suggestion = $scriptPartSuggestionRepository->getByUuidAndUser($suggestionUuid, $user);

        if ($suggestion === null) {
            throw new ScriptPartSuggestionNotFoundException();
        }

        $scriptPartSuggestionService->accept($suggestion);

        //TODO: Delete the suggestion after acceptation by the user ? (we don't need to keep the history here)
        return $this->json(
            data: $suggestion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_part_suggestions_show']],
        );
    }

    #[Route('/{suggestionUuid}/reject', name: 'api_script_part_suggestions_reject', methods: ['POST'])]
    public function reject(
        string $suggestionUuid,
        ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
        ScriptPartSuggestionService $scriptPartSuggestionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $suggestion = $scriptPartSuggestionRepository->getByUuidAndUser($suggestionUuid, $user);

        if ($suggestion === null) {
            throw new ScriptPartSuggestionNotFoundException();
        }

        $scriptPartSuggestionService->reject($suggestion);

        //TODO: Delete the suggestion after rejection by the user ? (we don't need to keep the history here)
        return $this->json(
            data: $suggestion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_part_suggestions_show']],
        );
    }
}
