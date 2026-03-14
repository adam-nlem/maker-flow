<?php

namespace App\Service\Stripe;

use App\Entity\Enum\StripeProductType;
use App\Service\RedisStore\RedisStoreService;
use Stripe\Price;
use Stripe\Product;
use Stripe\Stripe;

class StripeRefillService
{
    private const CACHE_TTL_SECONDS = 3600;

    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly RedisStoreService $redisStoreService,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    public function getRefillPriceId(): ?string
    {
        $cached = $this->redisStoreService->get(RedisStoreService::getStripeRefillKey());

        if ($cached !== null) {
            return $cached;
        }

        return $this->refreshCache();
    }

    public function refreshCache(): ?string
    {
        $priceId = $this->fetchRefillPriceIdFromStripe();

        if ($priceId !== null) {
            $this->redisStoreService->set(
                RedisStoreService::getStripeRefillKey(),
                $priceId,
                time() + self::CACHE_TTL_SECONDS,
            );
        }

        return $priceId;
    }

    private function fetchRefillPriceIdFromStripe(): ?string
    {
        $products = Product::all(['active' => true]);

        foreach ($products->data as $product) {
            $metadata = $product->metadata->toArray();

            if (($metadata['type'] ?? null) !== StripeProductType::Refill->value) {
                continue;
            }

            if ($product->default_price === null) {
                continue;
            }

            return $product->default_price;
        }

        return null;
    }
}
