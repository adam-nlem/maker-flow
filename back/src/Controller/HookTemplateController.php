<?php

namespace App\Controller;

use App\DTO\QueryParam\HookTemplate\ListHookTemplatesQueryParamDTO;
use App\DTO\Request\HookTemplate\CreateHookTemplateRequestDTO;
use App\DTO\Request\HookTemplate\UpdateHookTemplateRequestDTO;
use App\Entity\Enum\HookTemplatePlaceholder;
use App\Entity\HookTemplate;
use App\Entity\User;
use App\Repository\HookTemplateRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/hook-templates', requirements: ['hookTemplateUuid' => Requirement::UUID])]
final class HookTemplateController extends AbstractController
{
    #[Route('', name: 'api_hook_templates_list', methods: ['GET'])]
    public function list(
        ListHookTemplatesQueryParamDTO $queryParamDto,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $page = $queryParamDto->getPage();
        $limit = $queryParamDto->getLimit();

        if ($queryParamDto->getSearchTerm() !== null) {
            $hookTemplates = $hookTemplateRepository->searchByTitlePublicOrByUserPaginated($queryParamDto->getSearchTerm(), $user, $page, $limit);
        } else {
            $hookTemplates = $hookTemplateRepository->getPublicOrByUserPaginated($user, $page, $limit);
        }

        return $this->json(
            data: $hookTemplates,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_hook_templates_list']]
        );
    }

    #[Route('/placeholders', name: 'api_hook_templates_placeholders', methods: ['GET'])]
    public function placeholders(): JsonResponse
    {
        $placeholders = array_map(
            fn(HookTemplatePlaceholder $placeholder) => $placeholder->value,
            HookTemplatePlaceholder::cases()
        );

        return $this->json(data: $placeholders, status: Response::HTTP_OK);
    }

    #[Route('', name: 'api_hook_templates_create', methods: ['POST'])]
    public function create(
        CreateHookTemplateRequestDTO $dto,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        /** @var HookTemplate $hookTemplate */
        $hookTemplate = $dto->build();

        $hookTemplate->setUser($user);

        $hookTemplateRepository->save($hookTemplate, true);

        return $this->json(
            data: $hookTemplate,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_hook_templates_create']]
        );
    }

    #[Route('/{hookTemplateUuid}', name: 'api_hook_templates_update', methods: ['PATCH'])]
    public function update(
        string $hookTemplateUuid,
        UpdateHookTemplateRequestDTO $dto,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $hookTemplate = $hookTemplateRepository->getByUuidAndUser($hookTemplateUuid, $user);

        if ($hookTemplate === null) {
            return $this->json(data: ["message" => "You don't have any hook template with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $hookTemplate->getTitle()) {
            $hookTemplate->setTitle($dto->getTitle());
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $hookTemplate->getContent()) {
            $hookTemplate->setContent($dto->getContent());
        }

        if ($dto->getIsPublic() !== null && $dto->getIsPublic() !== $hookTemplate->isPublic()) {
            $hookTemplate->setIsPublic($dto->getIsPublic());
        }

        $hookTemplateRepository->save($hookTemplate, true);

        return $this->json(
            data: $hookTemplate,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_hook_templates_update']]
        );
    }

    #[Route('/{hookTemplateUuid}', name: 'api_hook_templates_delete', methods: ['DELETE'])]
    public function delete(
        string $hookTemplateUuid,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $hookTemplate = $hookTemplateRepository->getByUuidAndUser($hookTemplateUuid, $user);

        if ($hookTemplate === null) {
            return $this->json(data: ["message" => "You don't have any hook template with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $hookTemplateRepository->remove($hookTemplate, true);

        return $this->json(data: ["message" => "Hook template deleted successfully"], status: Response::HTTP_OK);
    }
}
