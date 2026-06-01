<?php

namespace App\Entity\Enum;

enum OnboardingStep: string
{
    case CreateAgency = 'create_agency';
    case CreateFirstProject = 'create_first_project';
    case InviteFirstClient = 'invite_first_client';
    case ConnectFirstIntegration = 'connect_first_integration';
    case ShowSubscriptions = 'show_subscriptions';
    case ExploreContents = 'explore_contents';
}
