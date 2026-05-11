<?php

namespace App\Controller;

use App\DTO\Request\Agency\CreateAgencyRequestDTO;
use App\DTO\Request\Agency\UpdateAgencyRequestDTO;
use App\Entity\Agency;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Agency\UserAlreadyHasAgencyException;
use App\Repository\AgencyRepository;
use App\Repository\UserRepository;
use App\Security\Voter\AgencyVoter;
use App\Service\Credit\CreditService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agencies')]
final class AgencyController extends AbstractController
{
    private const WELCOME_CREDITS = 3;

    #[Route('', name: 'api_agencies_create', methods: ['POST'])]
    #[IsGranted(UserRole::Admin->value)]
    public function create(
        CreateAgencyRequestDTO $dto,
        AgencyRepository $agencyRepository,
        UserRepository $userRepository,
        CreditService $creditService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->getAgency() !== null) {
            throw new UserAlreadyHasAgencyException();
        }

        /** @var Agency $agency */
        $agency = $dto->build();

        $agencyRepository->save($agency, true);

        $user->setAgency($agency);
        $userRepository->save($user, true);

        $creditService->addWelcomeCredits($agency, self::WELCOME_CREDITS, $user);

        return $this->json(
            data: $agency,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_agency_create']],
        );
    }

    #[Route('/current', name: 'api_agencies_current', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function current(AgencyRepository $agencyRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        return $this->json(
            data: $agency,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_agency_current']],
        );
    }

    #[Route('', name: 'api_agencies_update', methods: ['PATCH'])]
    #[IsGranted(UserRole::Admin->value)]
    public function update(
        UpdateAgencyRequestDTO $dto,
        AgencyRepository $agencyRepository,
    ): JsonResponse {
        $agencyUuid = $dto->getAgencyUuid();

        if ($agencyUuid === null) {
            throw new MissingAgencyException();
        }

        $agency = $agencyRepository->getByUuid($agencyUuid);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $this->denyAccessUnlessGranted(AgencyVoter::MANAGE_SETTINGS, $agency);

        if ($dto->getName() !== null && $dto->getName() !== $agency->getName()) {
            $agency->setName($dto->getName());
        }

        if ($dto->getBrandColor() !== null && $dto->getBrandColor() !== $agency->getBrandColor()) {
            $agency->setBrandColor($dto->getBrandColor());
        }

        if ($dto->getContactEmail() !== null && $dto->getContactEmail() !== $agency->getContactEmail()) {
            $agency->setContactEmail($dto->getContactEmail());
        }

        if ($dto->getWebsite() !== null && $dto->getWebsite() !== $agency->getWebsite()) {
            $agency->setWebsite($dto->getWebsite());
        }

        $agencyRepository->save($agency, true);

        return $this->json(
            data: $agency,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_agency_update']],
        );
    }
}
