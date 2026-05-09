<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\PostInsight\ShowPostInsightDetailQueryParamDTO;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Post\PostNotFoundException;
use App\Exception\Stripe\ActiveSubscriptionRequiredException;
use App\Repository\AgencyRepository;
use App\Repository\PostRepository;
use App\Repository\SubscriptionRepository;
use App\Service\PostInsight\PostInsightService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/post-insights')]
final class PostInsightController extends AbstractController
{

    #[Route('/detail', name: 'api_post_insights_detail', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function detail(
        ShowPostInsightDetailQueryParamDTO $queryParamDto,
        AgencyRepository $agencyRepository,
        PostRepository $postRepository,
        PostInsightService $postInsightService,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $post = $postRepository->getAccessibleByUuidForUser($queryParamDto->getPostUuid(), $user);

        if ($post === null) {
            throw new PostNotFoundException();
        }

        $agency = $agencyRepository->getByProject($post->getIntegration()->getProject());

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        if ($subscriptionRepository->getLatestActiveByAgency($agency) === null) {
            throw new ActiveSubscriptionRequiredException();
        }

        $detail = $postInsightService->getDetail($post);

        return $this->json(
            data: $detail->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_insights_detail']],
        );
    }
}
