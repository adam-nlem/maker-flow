<?php

namespace App\Entity\Enum;

enum ProjectType: string
{
    case Saas = 'saas';
    case ContentCreation = 'content_creation';
    case MobileApp = 'mobile_app';
    case Extension = 'extension';
    case Automation = 'automation';
    case WebApp = 'web_app';
    case LandingPage = 'landing_page';
    case Blog = 'blog';
    case Portfolio = 'portfolio';
    case Hardware = 'hardware';
    case Iot = 'iot';
}
