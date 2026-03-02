<?php

namespace App\DTO\Response\Subscription;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class CreateSubscriptionCheckoutResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_subscriptions_checkout'])]
        private string $checkoutUrl,
    ) {}

    public function getData(): array
    {
        return [
            'checkout_url' => $this->getCheckoutUrl(),
        ];
    }

    public function getCheckoutUrl(): string
    {
        return $this->checkoutUrl;
    }
}
