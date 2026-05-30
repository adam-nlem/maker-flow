<?php

namespace App\Entity\Enum;

enum AgencyCollaboratorOnboardingStep: string
{
    case ExploreProjects = 'explore_projects';
    case ExploreContents = 'explore_contents';
}
