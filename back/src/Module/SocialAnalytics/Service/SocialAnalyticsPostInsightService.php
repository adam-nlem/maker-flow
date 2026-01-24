<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostDTO;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostInsightDTO;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsPostInsightService
{
    private string $instagramGraphUrl;

    public function __construct(
        private readonly SocialAnalyticsPostInsightRepository $postInsightRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsPostService $postService,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
    ) {
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
    }

    public function fetchInstagramPostInsights(Integration $integration): void
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $url = sprintf('%s/%s/media', $this->instagramGraphUrl, $integration->getAccountId());

        $metrics = implode(',', InstagramPostInsightDTO::getMetricNames());

        $queryParams =  [
            'fields' => sprintf('id,media_type,timestamp,thumbnail_url,caption,insights.metric(%s)', $metrics),
            'limit' => 100,
            'access_token' => $integration->getAccessToken(),
        ];

        do {
            $response = $this->httpClient->request('GET', $url, ['query' => $queryParams]);
            $data = $response->toArray();

            foreach ($data['data'] as $postData) {
                $this->processPostData($integration, $postData);
            }

            $url = $data['paging']['next'] ?? null;
            $queryParams = [];
        } while ($url !== null);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    private function processPostData(Integration $integration, array $postData): void
    {
        $postDTO = InstagramPostDTO::fromArray($postData);

        $post = $this->postService->createOrGetPost(
            $integration,
            $postDTO
        );

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights());
    }

    private function createPostInsights(SocialAnalyticsPost $post, array $postInsightDTOs): void
    {
        /** @var InstagramPostInsightDTO $postInsightDTO */
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($this->shouldCreateInsight(post: $post, postInsightDTO: $postInsightDTO)) {
                $insight = new SocialAnalyticsPostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($postInsightDTO->getValue())
                    ->setSocialAnalyticsPost($post)
                    ->setUser($post->getUser());

                $this->postInsightRepository->save(entity: $insight);
            }
        }
    }

    private function shouldCreateInsight(SocialAnalyticsPost $post, InstagramPostInsightDTO $postInsightDTO): bool
    {
        if ($post->getId() === null) {
            return true;
        }

        return $this->postInsightRepository->getLatestByPostAndByTypeAndByValue(
            post: $post,
            type: $postInsightDTO->getType(),
            value: $postInsightDTO->getValue()
        ) === null;
    }
}
