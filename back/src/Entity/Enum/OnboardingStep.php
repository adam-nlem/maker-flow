<?php

namespace App\Entity\Enum;

enum OnboardingStep: string
{
    case CreateFirstProject = 'create_first_project';
    case ConnectIntegration = 'connect_integration';
    case CreateCreatorProfile = 'create_creator_profile';
    case CreateFirstScript = 'create_first_script';
    case GenerateFirstScript = 'generate_first_script';
    case ShowSubscriptions = 'show_subscriptions';
}
