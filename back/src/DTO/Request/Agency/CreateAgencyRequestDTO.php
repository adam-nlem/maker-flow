<?php

namespace App\DTO\Request\Agency;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Agency;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateAgencyRequestDTO extends AbstractRequestDTO
{
    private string $name;
    private ?string $accentColor = null;
    private ?string $backgroundColor = null;
    private ?string $backgroundSecondaryColor = null;
    private ?string $textColor = null;
    private ?string $textSecondaryColor = null;
    private ?string $headingFont = null;
    private ?string $bodyFont = null;
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

    protected function buildObject(): Agency
    {
        $agency = new Agency();
        $agency->setName($this->getName());

        if ($this->getAccentColor() !== null) {
            $agency->setAccentColor($this->getAccentColor());
        }

        if ($this->getBackgroundColor() !== null) {
            $agency->setBackgroundColor($this->getBackgroundColor());
        }

        if ($this->getBackgroundSecondaryColor() !== null) {
            $agency->setBackgroundSecondaryColor($this->getBackgroundSecondaryColor());
        }

        if ($this->getTextColor() !== null) {
            $agency->setTextColor($this->getTextColor());
        }

        if ($this->getTextSecondaryColor() !== null) {
            $agency->setTextSecondaryColor($this->getTextSecondaryColor());
        }

        if ($this->getHeadingFont() !== null) {
            $agency->setHeadingFont($this->getHeadingFont());
        }

        if ($this->getBodyFont() !== null) {
            $agency->setBodyFont($this->getBodyFont());
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
