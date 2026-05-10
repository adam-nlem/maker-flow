<?php

namespace App\DTO\Request\Agency;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Agency;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateAgencyRequestDTO extends AbstractRequestDTO
{
    private string $name;
    private ?string $brandColor = null;
    private ?string $contactEmail = null;
    private ?string $website = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->name = $payload['name'];
        $this->brandColor = $payload['brandColor'] ?? null;
        $this->contactEmail = $payload['contactEmail'] ?? null;
        $this->website = $payload['website'] ?? null;
    }

    protected function buildObject(): Agency
    {
        $agency = new Agency();
        $agency->setName($this->getName());

        if ($this->getBrandColor() !== null) {
            $agency->setBrandColor($this->getBrandColor());
        }

        if ($this->getContactEmail() !== null) {
            $agency->setContactEmail($this->getContactEmail());
        }

        if ($this->getWebsite() !== null) {
            $agency->setWebsite($this->getWebsite());
        }

        return $agency;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getBrandColor(): ?string
    {
        return $this->brandColor;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }
}
