<?php

namespace App\Controller;

use App\DTO\Request\Agency\CreateAgencyRequestDTO;
use App\Entity\Agency;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Agency\UserAlreadyHasAgencyException;
use App\Repository\AgencyRepository;
use App\Repository\UserRepository;
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
}
