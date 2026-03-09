<?php

namespace App\DTO\Request\CreatorProfile;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\CreatorProfile;
use App\Entity\Enum\ContentType;
use App\Entity\Enum\Platform;
use App\Entity\Enum\Tone;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateOrUpdateCreatorProfileRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private ?array $platforms;
    private ?ContentType $contentType;
    private ?string $niche;
    private ?string $targetAudience;
    private ?array $tones;
    private ?array $signaturePhrases;
    private ?array $neverList;
    private ?string $styleSample;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->platforms = isset($payload["platforms"])
            ? array_filter(array_map(fn(string $platform) => Platform::tryFrom($platform), $payload["platforms"]))
            : null;
        $this->contentType = isset($payload["contentType"]) ? ContentType::tryFrom($payload["contentType"]) : null;
        $this->niche = $payload["niche"] ?? null;
        $this->targetAudience = $payload["targetAudience"] ?? null;
        $this->tones = $payload["tones"] ?? null;
        $this->signaturePhrases = $payload["signaturePhrases"] ?? null;
        $this->neverList = $payload["neverList"] ?? null;
        $this->styleSample = $payload["styleSample"] ?? null;
    }

    protected function buildObject(): CreatorProfile
    {
        $creatorProfile = new CreatorProfile();

        return $creatorProfile
            ->setPlatforms($this->platforms)
            ->setContentType($this->contentType)
            ->setNiche($this->niche)
            ->setTargetAudience($this->targetAudience)
            ->setTones($this->tones)
            ->setSignaturePhrases($this->signaturePhrases)
            ->setNeverList($this->neverList)
            ->setStyleSample($this->styleSample);
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getPlatforms(): ?array
    {
        return $this->platforms;
    }

    public function getContentType(): ?ContentType
    {
        return $this->contentType;
    }

    public function getNiche(): ?string
    {
        return $this->niche;
    }

    public function getTargetAudience(): ?string
    {
        return $this->targetAudience;
    }

    public function getTones(): ?array
    {
        return $this->tones;
    }

    public function getSignaturePhrases(): ?array
    {
        return $this->signaturePhrases;
    }

    public function getNeverList(): ?array
    {
        return $this->neverList;
    }

    public function getStyleSample(): ?string
    {
        return $this->styleSample;
    }
}
