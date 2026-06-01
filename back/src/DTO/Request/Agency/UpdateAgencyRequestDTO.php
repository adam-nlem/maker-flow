<?php

namespace App\DTO\Request\Agency;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateAgencyRequestDTO extends AbstractRequestDTO
{
    private ?string $agencyUuid;
    private ?string $name;
    private ?string $contactEmail;
    private ?string $website;
    private ?File $logo;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct(
            $requestStack,
            $validator,
            $requestStack->getCurrentRequest()->request->all(),
        );
    }

    public function fromPayload(array $payload): void
    {
        $this->agencyUuid = $payload['agencyUuid'] ?? null;
        $this->name = $payload['name'] ?? null;
        $this->contactEmail = $payload['contactEmail'] ?? null;
        $this->website = $payload['website'] ?? null;
        $this->logo  = $this->requestStack->getCurrentRequest()->files->get('logo') ?? null;
    }

    public function buildObject(): array
    {
        return [
            'agencyUuid' => $this->getAgencyUuid(),
            'name' => $this->getName(),
            'contactEmail' => $this->getContactEmail(),
            'website' => $this->getWebsite(),
            'logo' => $this->getLogo(),
        ];
    }

    public function getAgencyUuid(): ?string
    {
        return $this->agencyUuid;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function getLogo(): ?File
    {
        return $this->logo;
    }
}
