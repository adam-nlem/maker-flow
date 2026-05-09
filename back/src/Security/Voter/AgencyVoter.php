<?php

namespace App\Security\Voter;

use App\Entity\Agency;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class AgencyVoter extends Voter
{
    public const VIEW = 'AGENCY_VIEW';
    public const MANAGE_PROJECTS = 'AGENCY_MANAGE_PROJECTS';
    public const MANAGE_SETTINGS = 'AGENCY_MANAGE_SETTINGS';
    public const MANAGE_BILLING = 'AGENCY_MANAGE_BILLING';
    public const MANAGE_COLLABORATORS = 'AGENCY_MANAGE_COLLABORATORS';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::MANAGE_PROJECTS, self::MANAGE_SETTINGS, self::MANAGE_BILLING, self::MANAGE_COLLABORATORS], true)
            && $subject instanceof Agency;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Agency $subject */
        if ($user->getAgency()?->getId() !== $subject->getId()) {
            return false;
        }

        return match ($attribute) {
            self::VIEW => true,
            self::MANAGE_PROJECTS => $user->hasRole(UserRole::Editor) || $user->hasRole(UserRole::Admin),
            self::MANAGE_SETTINGS, self::MANAGE_BILLING, self::MANAGE_COLLABORATORS => $user->hasRole(UserRole::Admin),
            default => false,
        };
    }
}
