<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Module\SocialAnalytics\Service\SocialAnalyticsPostGroupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/post-groups')]
final class SocialAnalyticsPostGroupController extends AbstractController
{
    public function __construct(private SocialAnalyticsPostGroupService $service)
    {
    }
}
