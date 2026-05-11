<?php

namespace App\Entity\Enum;

enum OnboardingStep: string
{
    case CreateAgency = 'create_agency';
    case CreateFirstProject = 'create_first_project';
    case ConnectIntegration = 'connect_integration';
    case CreateFirstScript = 'create_first_script';
    case GenerateFirstScript = 'generate_first_script';
    case ShowSubscriptions = 'show_subscriptions';
}
