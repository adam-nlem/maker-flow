<?php

namespace App\Entity\Enum;

enum AgencyCollaboratorOnboardingStep: string
{
    case WelcomeTour = 'welcome_tour';
    case ExploreProjects = 'explore_projects';
    case ExploreContents = 'explore_contents';
}
