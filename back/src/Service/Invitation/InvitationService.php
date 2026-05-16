<?php

namespace App\Service\Invitation;

use App\DTO\Request\Invitation\CreateInvitationRequestDTO;
use App\Entity\Enum\InvitationType;
use App\Entity\Enum\UserRole;
use App\Entity\Invitation;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Invitation\EmailAlreadyUsedException;
use App\Exception\Invitation\InvalidInvitationProjectException;
use App\Exception\Invitation\InvalidInvitationRoleException;
use App\Exception\Invitation\InvalidInvitationTypeException;
use App\Exception\Invitation\InvitationAlreadyUsedException;
use App\Exception\Invitation\InvitationExpiredException;
use App\Exception\Invitation\InvitationNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\User\InvalidPasswordException;
use App\Helper\DateHelper;
use App\Helper\PasswordHelper;
use App\Message\SendEmailMessage;
use App\Repository\AgencyRepository;
use App\Repository\InvitationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use App\Service\Mailing\Template\ClientWelcomeEmailTemplate;
use App\Service\Mailing\Template\CollaboratorWelcomeEmailTemplate;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class InvitationService
{
    private const EXPIRATION_DAYS = 7;

    public function __construct(
        private readonly InvitationRepository $invitationRepository,
        private readonly UserRepository $userRepository,
        private readonly AgencyRepository $agencyRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly MessageBusInterface $messageBus,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly string $frontendUrl,
    ) {}

    public function createInvitation(User $createdBy, CreateInvitationRequestDTO $dto): Invitation
    {
        return match ($dto->getType()) {
            InvitationType::Collaborator => $this->createForCollaborator($createdBy, $dto),
            InvitationType::Client => $this->createForClient($createdBy, $dto),
            null => throw new InvalidInvitationTypeException(),
        };
    }

    /**
     * @throws InvitationNotFoundException
     * @throws InvitationAlreadyUsedException
     * @throws InvitationExpiredException
     */
    public function verifyToken(string $token): Invitation
    {
        $invitation = $this->invitationRepository->getByToken($token);

        if ($invitation === null) {
            throw new InvitationNotFoundException();
        }

        if ($invitation->isUsed()) {
            throw new InvitationAlreadyUsedException();
        }

        if ($invitation->isExpired()) {
            throw new InvitationExpiredException();
        }

        return $invitation;
    }

    /**
     * @throws InvitationNotFoundException
     * @throws InvitationAlreadyUsedException
     * @throws InvitationExpiredException
     * @throws InvalidPasswordException
     * @throws EmailAlreadyUsedException
     */
    public function completeSetup(Invitation $invitation, string $plainPassword): User
    {
        $invitation = $this->verifyToken($invitation->getToken());

        if (!PasswordHelper::isValid($plainPassword)) {
            throw new InvalidPasswordException();
        }

        if ($this->userRepository->getByEmail($invitation->getEmail()) !== null) {
            throw new EmailAlreadyUsedException();
        }

        $user = (new User())
            ->setFirstName($invitation->getFirstName())
            ->setLastName($invitation->getLastName())
            ->setEmail($invitation->getEmail())
            ->setVerifiedAt(DateHelper::createUtcDateTimeImmutable());

        if ($invitation->getType() === InvitationType::Collaborator) {
            $user->setAgency($invitation->getAgency())
                ->setRole($invitation->getRole());
        } else {
            $user->setProject($invitation->getProject())
                ->setRole(UserRole::Client);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));

        $invitation->setUsedAt(DateHelper::createUtcDateTimeImmutable());

        $this->userRepository->save($user, false);
        $this->invitationRepository->save($invitation, true);

        return $user;
    }

    private function createForCollaborator(User $createdBy, CreateInvitationRequestDTO $dto): Invitation
    {
        $agency = $this->agencyRepository->getByCollaborator($createdBy);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $role = $dto->getRole();

        if ($role !== UserRole::Editor && $role !== UserRole::Viewer) {
            throw new InvalidInvitationRoleException();
        }

        if ($this->userRepository->getByEmail($dto->getEmail()) !== null) {
            throw new EmailAlreadyUsedException();
        }

        $this->invitationRepository->invalidatePendingForCollaborator($dto->getEmail(), $agency);

        $invitation = (new Invitation())
            ->setType(InvitationType::Collaborator)
            ->setToken($this->generateUniqueToken())
            ->setEmail($dto->getEmail())
            ->setFirstName($dto->getFirstName())
            ->setLastName($dto->getLastName())
            ->setRole($role)
            ->setAgency($agency)
            ->setCreatedBy($createdBy)
            ->setExpiresAt(DateHelper::createUtcDateTimeImmutable()->modify('+' . self::EXPIRATION_DAYS . ' days'));

        $this->invitationRepository->save($invitation, true);

        $template = new CollaboratorWelcomeEmailTemplate(
            $dto->getEmail(),
            $dto->getFirstName(),
            $agency->getName(),
            trim(($createdBy->getFirstName() ?? '') . ' ' . ($createdBy->getLastName() ?? '')),
            $this->getRoleLabel($role),
            $this->buildSetupUrl($invitation->getToken()),
        );

        $this->messageBus->dispatch(new SendEmailMessage($template));

        return $invitation;
    }

    private function createForClient(User $createdBy, CreateInvitationRequestDTO $dto): Invitation
    {
        if ($dto->getProjectUuid() === null) {
            throw new InvalidInvitationProjectException();
        }

        $project = $this->projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $createdBy);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($this->userRepository->getByEmail($dto->getEmail()) !== null) {
            throw new EmailAlreadyUsedException();
        }

        $this->invitationRepository->invalidatePendingForClient($dto->getEmail(), $project);

        $agency = $project->getAgency();

        $invitation = (new Invitation())
            ->setType(InvitationType::Client)
            ->setToken($this->generateUniqueToken())
            ->setEmail($dto->getEmail())
            ->setFirstName($dto->getFirstName())
            ->setLastName($dto->getLastName())
            ->setAgency($agency)
            ->setProject($project)
            ->setCreatedBy($createdBy)
            ->setExpiresAt(DateHelper::createUtcDateTimeImmutable()->modify('+' . self::EXPIRATION_DAYS . ' days'));

        $this->invitationRepository->save($invitation, true);

        $template = new ClientWelcomeEmailTemplate(
            $dto->getEmail(),
            $dto->getFirstName(),
            $agency->getName(),
            $agency->getContactEmail(),
            $this->buildSetupUrl($invitation->getToken()),
        );

        $this->messageBus->dispatch(new SendEmailMessage($template));

        return $invitation;
    }

    private function generateUniqueToken(): string
    {
        do {
            $token = bin2hex(random_bytes(32));
        } while ($this->invitationRepository->getByToken($token) !== null);

        return $token;
    }

    private function buildSetupUrl(string $token): string
    {
        return rtrim($this->frontendUrl, '/') . '/invite/' . $token;
    }

    private function getRoleLabel(UserRole $role): string
    {
        return match ($role) {
            UserRole::Editor => 'Editeur',
            UserRole::Viewer => 'Viewer',
            default => $role->value,
        };
    }
}
