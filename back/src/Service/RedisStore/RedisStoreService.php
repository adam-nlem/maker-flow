<?php

namespace App\Service\RedisStore;

use Predis\Client as PredisClient;

class RedisStoreService
{
    private PredisClient $client;

    public function __construct(
        private string $scheme,
        private string $host,
        private string $port,
    ) {
        $this->client = new PredisClient([
            'scheme' => $this->scheme,
            'host' => $this->host,
            'port' => $this->port,
        ]);
    }

    public function getClient(): PredisClient
    {
        return $this->client;
    }

    public function exists(string $key): bool
    {
        $count = $this->client->exists($key);
        return $count > 0;
    }

    public function get(string $key): mixed
    {
        return $this->client->get($key);
    }

    public function set(string $key, mixed $value, ?int $expireAt = null): void
    {
        $this->client->set($key, $value);

        if ($expireAt) {
            $this->client->expireat($key, $expireAt);
        }
    }

    public function delete(string $key): void
    {
        $this->client->del($key);
    }

    

    public static function getIntegrationStateKey(string $state): string
    {
        return sprintf('INTEGRATION/STATE/%s', $state);
    }

    public static function getStripePlansKey(): string
    {
        return 'STRIPE/PLANS';
    }

    public static function getStripeRefillKey(): string
    {
        return 'STRIPE/REFILL';
    }

    public static function getResendSegmentKey(string $name): string
    {
        return sprintf('RESEND/SEGMENT/%s', $name);
    }

    public static function getResendSyncedTierKey(string $userUuid, string $tierValue): string
    {
        return sprintf('RESEND/SYNCED_TIER/%s/%s', $userUuid, $tierValue);
    }
}
