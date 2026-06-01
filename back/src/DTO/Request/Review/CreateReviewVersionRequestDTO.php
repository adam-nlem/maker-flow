<?php

namespace App\DTO\Request\Review;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\ReviewVersion;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateReviewVersionRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $reviewUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        $request = $requestStack->getCurrentRequest();
        $payload = $request !== null ? $request->request->all() : [];
        parent::__construct($requestStack, $validator, $payload);
    }

    protected function fromPayload(array $payload): void
    {
        $this->reviewUuid = $payload['reviewUuid'] ?? '';
    }

    protected function buildObject(): ReviewVersion
    {
        return new ReviewVersion();
    }

    public function getReviewUuid(): string
    {
        return $this->reviewUuid;
    }
}
