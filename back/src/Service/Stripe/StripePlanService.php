<?php

namespace App\Service\Stripe;

use App\DTO\Response\Subscription\PlanConfigResponseDTO;
use App\Entity\Enum\StripeProductType;
use App\Entity\Enum\SubscriptionPlan;
use App\Service\RedisStore\RedisStoreService;
use Stripe\Price;
use Stripe\Product;
use Stripe\Stripe;

class StripePlanService
{
    private const CACHE_TTL_SECONDS = 3600;

    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly RedisStoreService $redisStoreService,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    /**
     * @return PlanConfigResponseDTO[]
     */
    public function getPlanConfigs(): array
    {
        $cached = $this->redisStoreService->get(RedisStoreService::getStripePlansKey());

        if ($cached !== null) {
            return array_map(
                fn(array $plan) => PlanConfigResponseDTO::fromArray($plan),
                json_decode($cached, true),
            );
        }

        return $this->refreshCache();
    }

    public function getPlanConfigFromSubscription(SubscriptionPlan $plan): ?PlanConfigResponseDTO
    {
        $planConfigs = $this->getPlanConfigs();

        foreach ($planConfigs as $planConfig) {
            if ($planConfig->getPlan() === $plan->value) {
                return $planConfig;
            }
        }

        return null;
    }

    public function getPriceIdForPlan(SubscriptionPlan $plan): ?string
    {
        $plans = $this->getRawPlanConfigs();

        foreach ($plans as $planData) {
            if ($planData['plan'] === $plan->value) {
                return $planData['priceId'];
            }
        }

        return null;
    }

    public function resolvePlanFromPriceId(string $priceId): ?SubscriptionPlan
    {
        $plans = $this->getRawPlanConfigs();

        foreach ($plans as $planData) {
            if ($planData['priceId'] === $priceId) {
                return SubscriptionPlan::from($planData['plan']);
            }
        }

        return null;
    }

    /**
     * @return PlanConfigResponseDTO[]
     */
    public function refreshCache(): array
    {
        $plans = $this->fetchPlansFromStripe();

        $this->redisStoreService->set(
            RedisStoreService::getStripePlansKey(),
            json_encode($plans),
            time() + self::CACHE_TTL_SECONDS,
        );

        return array_map(
            fn(array $plan) => PlanConfigResponseDTO::fromArray($plan),
            $plans,
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function getRawPlanConfigs(): array
    {
        $cached = $this->redisStoreService->get(RedisStoreService::getStripePlansKey());

        if ($cached !== null) {
            return json_decode($cached, true);
        }

        return $this->fetchPlansFromStripe();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchPlansFromStripe(): array
    {
        $products = Product::all(['active' => true]);
        $plans = [];

        foreach ($products->data as $product) {
            $metadata = $product->metadata->toArray();

            if (($metadata['type'] ?? null) !== StripeProductType::Subscription->value) {
                continue;
            }

            if (!isset($metadata['plan'])) {
                continue;
            }

            $planValue = $metadata['plan'];

            if (SubscriptionPlan::tryFrom($planValue) === null) {
                continue;
            }

            if ($product->default_price === null) {
                continue;
            }

            $price = Price::retrieve($product->default_price);
            $priceMetadata = $price->metadata->toArray();

            $plans[] = [
                'plan' => $planValue,
                'priceId' => $price->id,
                'name' => $product->name,
                'monthlyPrice' => $price->unit_amount / 100,
                'currency' => $price->currency,
                'creditsPerMonth' => (int) ($priceMetadata['credit_amount'] ?? 0),
                'maxProjects' => ($metadata['max_projects'] ?? null) === 'null' ? null : (int) ($metadata['max_projects'] ?? 0),
                'maxScriptsPerProject' => ($metadata['max_scripts_per_project'] ?? null) === 'null' ? null : (int) ($metadata['max_scripts_per_project'] ?? 0),
                'maxEditorCollaborators' => ($metadata['max_editor_collaborators'] ?? null) === 'null' ? null : (int) ($metadata['max_editor_collaborators'] ?? 0),
                'maxVideoUploadHours' => ($metadata['max_video_upload_hours'] ?? null) === 'null' ? null : (int) ($metadata['max_video_upload_hours'] ?? 0),
                'maxStorageGb' => ($metadata['max_storage_gb'] ?? null) === 'null' ? null : (int) ($metadata['max_storage_gb'] ?? 0),
                'features' => array_map(fn($f) => $f['name'], $product->marketing_features ?? []),
                'isHighlighted' => ($metadata['is_highlighted'] ?? 'false') === 'true',
                'sortOrder' => (int) ($metadata['sort_order'] ?? 0),
            ];
        }

        usort($plans, fn(array $a, array $b) => $a['sortOrder'] <=> $b['sortOrder']);

        return $plans;
    }
}
