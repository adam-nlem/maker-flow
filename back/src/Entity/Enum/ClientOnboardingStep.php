<?php

namespace App\Entity\Enum;

enum ClientOnboardingStep: string
{
    case ConnectFirstIntegration = 'connect_first_integration';
    case ExploreContents = 'explore_contents';
}
