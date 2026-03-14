<?php

namespace App\DTO\Response\Credit;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class CreateRefillCheckoutResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_credits_refill_checkout'])]
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
