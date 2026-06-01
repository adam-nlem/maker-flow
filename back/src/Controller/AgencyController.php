<?php

namespace App\Controller;

use App\DTO\Request\Agency\CreateAgencyRequestDTO;
use App\DTO\Request\Agency\UpdateAgencyRequestDTO;
use App\Entity\Agency;
use App\Entity\Enum\FileInvalidReason;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Agency\AgencyLogoInvalidException;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Agency\UserAlreadyHasAgencyException;
use App\Repository\AgencyRepository;
use App\Security\Voter\AgencyVoter;
use App\Service\Agency\AgencyLogoService;
use App\Service\Credit\CreditService;
use App\Service\Subscription\SubscriptionLimitService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
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
        CreditService $creditService,
        AgencyLogoService $agencyLogoService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->getAgency() !== null) {
            throw new UserAlreadyHasAgencyException();
        }

        $logo = $dto->getLogo();

        if (!$logo instanceof UploadedFile) {
            throw new AgencyLogoInvalidException(FileInvalidReason::MissingFile);
        }

        $agencyLogoService->validate($logo);

        /** @var Agency $agency */
        $agency = $dto->build();
        $user->setAgency($agency);
        $agencyRepository->save($agency, true);

        $agencyLogoService->save($agency, $logo);

        $creditService->addWelcomeCredits($agency, self::WELCOME_CREDITS, $user);

        return $this->json(
            data: $agency,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_agencies_create']],
        );
    }

    #[Route('/usage', name: 'api_agencies_usage', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function usage(
        AgencyRepository $agencyRepository,
        SubscriptionLimitService $subscriptionLimitService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        return $this->json(
            data: $subscriptionLimitService->computeUsage($agency)->getData(),
            status: Response::HTTP_OK,
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
            context: ['groups' => ['api_agencies_current']],
        );
    }

    #[Route('', name: 'api_agencies_update', methods: ['PATCH'])]
    #[IsGranted(UserRole::Admin->value)]
    public function update(
        UpdateAgencyRequestDTO $dto,
        AgencyRepository $agencyRepository,
        AgencyLogoService $agencyLogoService,
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

        if ($dto->getContactEmail() !== null && $dto->getContactEmail() !== $agency->getContactEmail()) {
            $agency->setContactEmail($dto->getContactEmail());
        }

        if ($dto->getWebsite() !== null && $dto->getWebsite() !== $agency->getWebsite()) {
            $agency->setWebsite($dto->getWebsite());
        }

        if ($dto->getLogo() != null && $dto->getLogo() instanceof UploadedFile) {
            $agencyLogoService->validate($dto->getLogo());
            $agencyLogoService->save($agency, $dto->getLogo());
        }

        $agencyRepository->save($agency, true);

        return $this->json(
            data: $agency,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_agencies_update']],
        );
    }

    #[Route('/{agencyUuid}/logo', name: 'api_agencies_logo_show', methods: ['GET'], requirements: ['agencyUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::User->value)]
    public function showLogo(
        string $agencyUuid,
        AgencyRepository $agencyRepository,
        AgencyLogoService $agencyLogoService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByUuid($agencyUuid);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $userAgencyUuid = $user->getAgency()?->getUuid();
        $clientAgencyUuid = $user->getProject()?->getAgency()?->getUuid();

        if ($userAgencyUuid !== $agencyUuid && $clientAgencyUuid !== $agencyUuid) {
            throw new MissingAgencyException();
        }

        $logoFile = $agencyLogoService->getFile($agency);

        if ($logoFile === null) {
            throw new AgencyLogoInvalidException(FileInvalidReason::MissingFile);
        }

        return new BinaryFileResponse(
            $logoFile,
            Response::HTTP_OK,
            ['Content-Type' => $logoFile->getMimeType()],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE,
        );
    }
}
