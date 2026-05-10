<?php

namespace App\Controller;

use App\DTO\QueryParam\Project\ListProjectsQueryParamDTO;
use App\DTO\Request\Invitation\CreateClientInvitationRequestDTO;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\DTO\Request\Project\UpdateProjectRequestDTO;
use App\DTO\Response\Project\ListClientsResponseDTO;
use App\Entity\Project;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Project\ClientNotFoundException;
use App\Exception\Project\ProjectAlreadyFinishedException;
use App\Exception\Project\ProjectAlreadyOpenException;
use App\Exception\Project\ProjectLimitReachedException;
use App\Exception\Project\ProjectNameConflictException;
use App\Exception\Project\ProjectNotFoundException;
use App\Helper\DateHelper;
use App\Repository\AgencyRepository;
use App\Repository\InvitationRepository;
use App\Repository\ProjectRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\Invitation\InvitationService;
use App\Service\Stripe\StripePlanService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projects', requirements: ['projectUuid' => Requirement::UUID])]
final class ProjectController extends AbstractController
{
    #[Route('', name: 'api_projects_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateProjectRequestDTO $dto,
        AgencyRepository $agencyRepository,
        ProjectRepository $projectRepository,
        SubscriptionRepository $subscriptionRepository,
        StripePlanService $stripePlanService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $plan = $subscriptionRepository->getLatestActiveByAgency($agency)?->getPlan();
        $maxProjects = $plan !== null ? $stripePlanService->getPlanConfigFromSubscription($plan)?->getMaxProjects() : 1;

        if ($maxProjects !== null && $projectRepository->countByAgency($agency) >= $maxProjects) {
            throw new ProjectLimitReachedException();
        }

        /** @var Project $project */
        $project = $dto->build();

        $project->setAgency($agency);

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_create']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_EDITOR')]
    public function update(string $projectUuid, UpdateProjectRequestDTO $dto, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($dto->getName() !== null && $dto->getName() != $project->getName()) {
            $projectWithSameName = $projectRepository->getByNameAndAgency($dto->getName(), $project->getAgency());
            if ($projectWithSameName !== null) {
                throw new ProjectNameConflictException();
            }
            $project->setName($dto->getName());
        }

        if ($dto->getDescription() !== null && $dto->getDescription() != $project->getDescription()) {
            $project->setDescription($dto->getDescription());
        }

        if ($dto->getTypes() !== null && $dto->getTypes() !== []) {
            $project->setTypes($dto->getTypes());
        }

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_update']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_show', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function show(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_get_by_uuid']]);
    }

    #[Route('/{projectUuid}/finish', name: 'api_projects_finish', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function finish(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($project->getFinishedAt() !== null) {
            throw new ProjectAlreadyFinishedException();
        }

        $project->setFinishedAt(DateHelper::createUtcDateTimeImmutable());

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_finish']]);
    }

    #[Route('/{projectUuid}/reopen', name: 'api_projects_reopen', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function reopen(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($project->getFinishedAt() === null) {
            throw new ProjectAlreadyOpenException();
        }

        $project->setFinishedAt(null);

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_reopen']]);
    }

    #[Route('', name: 'api_projects_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListProjectsQueryParamDTO $queryParamDto,
        AgencyRepository $agencyRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            return $this->json(data: [], status: Response::HTTP_OK);
        }

        $projects = $projectRepository->getByAgencyPaginated($agency, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(data: $projects, status: Response::HTTP_OK, context: ['groups' => ['api_projects_get_paginated']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_EDITOR')]
    public function delete(
        string $projectUuid,
        ProjectRepository $projectRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $projectRepository->remove($project, true);

        return $this->json(data: ["message" => "Project deleted successfully"], status: Response::HTTP_OK);
    }

    #[Route('/{projectUuid}/clients', name: 'api_projects_clients_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function listClients(
        string $projectUuid,
        ProjectRepository $projectRepository,
        InvitationRepository $invitationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $project);

        $responseDto = new ListClientsResponseDTO(
            $project->getClientUsers(),
            $invitationRepository->findPendingForProject($project),
        );

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_clients_list', 'api_invitations_list']],
        );
    }

    #[Route('/{projectUuid}/clients', name: 'api_projects_clients_invite', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function inviteClient(
        string $projectUuid,
        CreateClientInvitationRequestDTO $dto,
        ProjectRepository $projectRepository,
        InvitationService $invitationService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_CLIENT, $project);

        $invitation = $invitationService->createForClient(
            $project,
            $user,
            $dto->getEmail(),
            $dto->getFirstName(),
            $dto->getLastName(),
        );

        return $this->json(
            data: $invitation,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_invitation_create']],
        );
    }

    #[Route('/{projectUuid}/clients/{clientUserUuid}', name: 'api_projects_clients_remove', methods: ['DELETE'], requirements: ['projectUuid' => Requirement::UUID, 'clientUserUuid' => Requirement::UUID])]
    #[IsGranted('ROLE_EDITOR')]
    public function removeClient(
        string $projectUuid,
        string $clientUserUuid,
        ProjectRepository $projectRepository,
        UserRepository $userRepository,
        TokenRepository $tokenRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_CLIENT, $project);

        $target = $userRepository->getByUuid($clientUserUuid);

        if ($target === null || $target->getProject()?->getId() !== $project->getId()) {
            throw new ClientNotFoundException();
        }

        $target->setProject(null);

        foreach ($target->getTokens() as $token) {
            $tokenRepository->remove($token, false);
        }

        $em->flush();

        return $this->json(data: null, status: Response::HTTP_NO_CONTENT);
    }
}
