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
use App\Repository\UserRepository;
use App\Security\Voter\AgencyVoter;
use App\Service\Agency\AgencyLogoService;
use App\Service\Credit\CreditService;
use App\Service\Subscription\SubscriptionLimitService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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

        $agencyRepository->save($agency, true);

        return $this->json(
            data: $agency,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_agencies_update']],
        );
    }

    #[Route('/logo', name: 'api_agencies_logo_upload', methods: ['POST'])]
    #[IsGranted(UserRole::Admin->value)]
    public function uploadLogo(
        Request $request,
        AgencyRepository $agencyRepository,
        AgencyLogoService $agencyLogoService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $this->denyAccessUnlessGranted(AgencyVoter::MANAGE_SETTINGS, $agency);

        $file = $request->files->get('logo');

        if (!$file instanceof UploadedFile) {
            throw new AgencyLogoInvalidException(FileInvalidReason::MissingFile);
        }

        $agencyLogoService->upload($agency, $file);

        return new Response(null, Response::HTTP_NO_CONTENT);
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
            return new Response(null, Response::HTTP_NO_CONTENT);
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
