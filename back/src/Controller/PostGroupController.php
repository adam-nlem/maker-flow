<?php

namespace App\Controller;

use App\Service\PostGroupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/post-groups')]
final class PostGroupController extends AbstractController
{
    public function __construct(private PostGroupService $service)
    {
    }
}
