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
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/script-part-suggestions', requirements: ['suggestionUuid' => Requirement::UUID])]
final class ScriptPartSuggestionController extends AbstractController
{
    #[Route('', name: 'api_script_part_suggestions_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListScriptPartSuggestionsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getAccessibleByUuidForUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $suggestions = $scriptPartSuggestionRepository->getByScript(
            $script,
            $queryParamDto->getStatus(),
        );

        return $this->json(
            data: $suggestions,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_part_suggestions_list']],
        );
    }

    #[Route('/{suggestionUuid}/accept', name: 'api_script_part_suggestions_accept', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function accept(
        string $suggestionUuid,
        ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
        ScriptPartSuggestionService $scriptPartSuggestionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $suggestion = $scriptPartSuggestionRepository->getAccessibleByUuidForUser($suggestionUuid, $user);

        if ($suggestion === null) {
            throw new ScriptPartSuggestionNotFoundException();
        }

        $scriptPartSuggestionService->accept($suggestion);

        return $this->json(
            data: $suggestion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_part_suggestions_show']],
        );
    }

    #[Route('/{suggestionUuid}/reject', name: 'api_script_part_suggestions_reject', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function reject(
        string $suggestionUuid,
        ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
        ScriptPartSuggestionService $scriptPartSuggestionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $suggestion = $scriptPartSuggestionRepository->getAccessibleByUuidForUser($suggestionUuid, $user);

        if ($suggestion === null) {
            throw new ScriptPartSuggestionNotFoundException();
        }

        $scriptPartSuggestionService->reject($suggestion);

        return $this->json(
            data: $suggestion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_part_suggestions_show']],
        );
    }
}
