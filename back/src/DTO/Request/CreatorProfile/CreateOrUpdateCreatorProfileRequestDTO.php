<?php

namespace App\DTO\Request\CreatorProfile;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\CreatorProfile;
use App\Entity\Enum\Tone;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateOrUpdateCreatorProfileRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private ?string $niche;
    private ?array $tones;
    private ?array $signaturePhrases;
    private ?array $neverList;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->niche = $payload["niche"] ?? null;
        $this->tones = $payload["tones"] ?? null;
        $this->signaturePhrases = $payload["signaturePhrases"] ?? null;
        $this->neverList = $payload["neverList"] ?? null;
    }

    protected function buildObject(): CreatorProfile
    {
        $creatorProfile = new CreatorProfile();

        return $creatorProfile
            ->setNiche($this->niche)
            ->setTones($this->tones)
            ->setSignaturePhrases($this->signaturePhrases)
            ->setNeverList($this->neverList);
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getNiche(): ?string
    {
        return $this->niche;
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

}
