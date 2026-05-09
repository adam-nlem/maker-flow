<?php

namespace App\Controller;

use App\DTO\QueryParam\HookTemplate\ListHookTemplatesQueryParamDTO;
use App\DTO\Request\HookTemplate\CreateHookTemplateRequestDTO;
use App\DTO\Request\HookTemplate\UpdateHookTemplateRequestDTO;
use App\Entity\Enum\HookTemplatePlaceholder;
use App\Entity\Enum\UserRole;
use App\Entity\HookTemplate;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\HookTemplate\HookTemplateModificationForbiddenException;
use App\Exception\HookTemplate\HookTemplateNotFoundException;
use App\Repository\AgencyRepository;
use App\Repository\HookTemplateRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/hook-templates', requirements: ['hookTemplateUuid' => Requirement::UUID])]
final class HookTemplateController extends AbstractController
{
    #[Route('', name: 'api_hook_templates_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListHookTemplatesQueryParamDTO $queryParamDto,
        AgencyRepository $agencyRepository,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $page = $queryParamDto->getPage();
        $limit = $queryParamDto->getLimit();

        if ($queryParamDto->getSearchTerm() !== null) {
            $hookTemplates = $hookTemplateRepository->searchByTitlePublicOrByAgencyPaginated($queryParamDto->getSearchTerm(), $agency, $page, $limit);
        } else {
            $hookTemplates = $hookTemplateRepository->getPublicOrByAgencyPaginated($agency, $page, $limit);
        }

        return $this->json(
            data: $hookTemplates,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_hook_templates_list']]
        );
    }

    #[Route('/placeholders', name: 'api_hook_templates_placeholders', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function placeholders(): JsonResponse
    {
        $placeholders = array_map(
            fn(HookTemplatePlaceholder $placeholder) => $placeholder->value,
            HookTemplatePlaceholder::cases()
        );

        return $this->json(data: $placeholders, status: Response::HTTP_OK);
    }

    #[Route('', name: 'api_hook_templates_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateHookTemplateRequestDTO $dto,
        AgencyRepository $agencyRepository,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        /** @var HookTemplate $hookTemplate */
        $hookTemplate = $dto->build();

        $hookTemplate
            ->setAgency($agency)
            ->setCreatedBy($user);

        $hookTemplateRepository->save($hookTemplate, true);

        return $this->json(
            data: $hookTemplate,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_hook_templates_create']]
        );
    }

    #[Route('/{hookTemplateUuid}', name: 'api_hook_templates_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $hookTemplateUuid,
        UpdateHookTemplateRequestDTO $dto,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $hookTemplate = $hookTemplateRepository->getAccessibleByUuidForUser($hookTemplateUuid, $user);

        if ($hookTemplate === null) {
            throw new HookTemplateNotFoundException();
        }

        if ($hookTemplate->getCreatedBy() !== $user && !$user->hasRole(UserRole::Admin)) {
            throw new HookTemplateModificationForbiddenException();
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
    #[IsGranted('ROLE_EDITOR')]
    public function delete(
        string $hookTemplateUuid,
        HookTemplateRepository $hookTemplateRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $hookTemplate = $hookTemplateRepository->getAccessibleByUuidForUser($hookTemplateUuid, $user);

        if ($hookTemplate === null) {
            throw new HookTemplateNotFoundException();
        }

        if ($hookTemplate->getCreatedBy() !== $user && !$user->hasRole(UserRole::Admin)) {
            throw new HookTemplateModificationForbiddenException();
        }

        $hookTemplateRepository->remove($hookTemplate, true);

        return $this->json(data: ["message" => "Hook template deleted successfully"], status: Response::HTTP_OK);
    }
}
