<?php

namespace App\Entity\Enum;

enum AgencyAdminOnboardingStep: string
{
    case WelcomeTour = 'welcome_tour';
    case CreateAgency = 'create_agency';
    case CreateFirstProject = 'create_first_project';
    case InviteFirstClient = 'invite_first_client';
    case ConnectFirstIntegration = 'connect_first_integration';
    case ShowSubscriptions = 'show_subscriptions';
}
