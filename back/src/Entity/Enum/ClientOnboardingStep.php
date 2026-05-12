<?php

namespace App\Entity\Enum;

enum ClientOnboardingStep: string
{
    case WelcomeTour = 'welcome_tour';
    case ConnectFirstIntegration = 'connect_first_integration';
    case ExploreContents = 'explore_contents';
}
