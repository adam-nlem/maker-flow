<?php

namespace App\DTO\Request\Agency;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateAgencyRequestDTO extends AbstractRequestDTO
{
    private ?string $agencyUuid;
    private ?string $name;
    private ?string $accentColor;
    private ?string $backgroundColor;
    private ?string $backgroundSecondaryColor;
    private ?string $textColor;
    private ?string $textSecondaryColor;
    private ?string $headingFont;
    private ?string $bodyFont;
    private ?string $contactEmail;
    private ?string $website;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload): void
    {
        $this->agencyUuid = $payload['agencyUuid'] ?? null;
        $this->name = $payload['name'] ?? null;
        $this->accentColor = $payload['accentColor'] ?? null;
        $this->backgroundColor = $payload['backgroundColor'] ?? null;
        $this->backgroundSecondaryColor = $payload['backgroundSecondaryColor'] ?? null;
        $this->textColor = $payload['textColor'] ?? null;
        $this->textSecondaryColor = $payload['textSecondaryColor'] ?? null;
        $this->headingFont = $payload['headingFont'] ?? null;
        $this->bodyFont = $payload['bodyFont'] ?? null;
        $this->contactEmail = $payload['contactEmail'] ?? null;
        $this->website = $payload['website'] ?? null;
    }

    public function buildObject(): array
    {
        return [
            'agencyUuid' => $this->getAgencyUuid(),
            'name' => $this->getName(),
            'accentColor' => $this->getAccentColor(),
            'backgroundColor' => $this->getBackgroundColor(),
            'backgroundSecondaryColor' => $this->getBackgroundSecondaryColor(),
            'textColor' => $this->getTextColor(),
            'textSecondaryColor' => $this->getTextSecondaryColor(),
            'headingFont' => $this->getHeadingFont(),
            'bodyFont' => $this->getBodyFont(),
            'contactEmail' => $this->getContactEmail(),
            'website' => $this->getWebsite(),
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

    public function getAccentColor(): ?string
    {
        return $this->accentColor;
    }

    public function getBackgroundColor(): ?string
    {
        return $this->backgroundColor;
    }

    public function getBackgroundSecondaryColor(): ?string
    {
        return $this->backgroundSecondaryColor;
    }

    public function getTextColor(): ?string
    {
        return $this->textColor;
    }

    public function getTextSecondaryColor(): ?string
    {
        return $this->textSecondaryColor;
    }

    public function getHeadingFont(): ?string
    {
        return $this->headingFont;
    }

    public function getBodyFont(): ?string
    {
        return $this->bodyFont;
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
