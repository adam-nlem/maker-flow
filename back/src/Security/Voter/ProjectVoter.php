<?php

namespace App\Security\Voter;

use App\Entity\Enum\UserRole;
use App\Entity\Project;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ProjectVoter extends Voter
{
    public const VIEW = 'PROJECT_VIEW';
    public const EDIT = 'PROJECT_EDIT';
    public const MANAGE_INTEGRATIONS = 'PROJECT_MANAGE_INTEGRATIONS';
    public const MANAGE_CLIENT = 'PROJECT_MANAGE_CLIENT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT, self::MANAGE_INTEGRATIONS, self::MANAGE_CLIENT], true)
            && $subject instanceof Project;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Project $subject */
        return match ($attribute) {
            self::VIEW => $this->canView($user, $subject),
            self::EDIT, self::MANAGE_CLIENT => $this->isAgencyEditor($user, $subject),
            self::MANAGE_INTEGRATIONS => $this->canManageIntegrations($user, $subject),
            default => false,
        };
    }

    private function canView(User $user, Project $project): bool
    {
        if ($user->hasRole(UserRole::Client)) {
            return $user->getProject()?->getId() === $project->getId();
        }

        return $user->getAgency()?->getId() === $project->getAgency()?->getId();
    }

    private function isAgencyEditor(User $user, Project $project): bool
    {
        if ($user->getAgency()?->getId() !== $project->getAgency()?->getId()) {
            return false;
        }

        return $user->hasRole(UserRole::Editor) || $user->hasRole(UserRole::Admin);
    }

    private function canManageIntegrations(User $user, Project $project): bool
    {
        if ($this->isAgencyEditor($user, $project)) {
            return true;
        }

        return $user->hasRole(UserRole::Client) && $user->getProject()?->getId() === $project->getId();
    }
}
