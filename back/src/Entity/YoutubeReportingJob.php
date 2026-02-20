<?php

namespace App\Entity;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Entity\Enum\YoutubeReportType;
use App\Repository\YoutubeReportingJobRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: YoutubeReportingJobRepository::class)]
#[ORM\UniqueConstraint(name: 'unique_integration_report_type', columns: ['integration_id', 'report_type'])]
#[ORM\HasLifecycleCallbacks]
class YoutubeReportingJob
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    private ?string $uuid = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 255)]
    private ?string $externalJobId = null;

    #[ORM\Column(enumType: YoutubeReportType::class)]
    private ?YoutubeReportType $reportType = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lastProcessedReportId = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $lastProcessedReportDate = null;

    #[ORM\ManyToOne(targetEntity: Integration::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Integration $integration = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    public function __construct()
    {
        if (null === $this->uuid) {
            $this->uuid = Uuid::v4();
        }

        if (null === $this->createdAt) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getExternalJobId(): ?string
    {
        return $this->externalJobId;
    }

    public function setExternalJobId(string $externalJobId): static
    {
        $this->externalJobId = $externalJobId;
        return $this;
    }

    public function getReportType(): ?YoutubeReportType
    {
        return $this->reportType;
    }

    public function setReportType(YoutubeReportType $reportType): static
    {
        $this->reportType = $reportType;
        return $this;
    }

    public function getLastProcessedReportId(): ?string
    {
        return $this->lastProcessedReportId;
    }

    public function setLastProcessedReportId(?string $lastProcessedReportId): static
    {
        $this->lastProcessedReportId = $lastProcessedReportId;
        return $this;
    }

    public function getLastProcessedReportDate(): ?\DateTimeImmutable
    {
        return $this->lastProcessedReportDate;
    }

    public function setLastProcessedReportDate(?\DateTimeImmutable $lastProcessedReportDate): static
    {
        $this->lastProcessedReportDate = $lastProcessedReportDate;
        return $this;
    }

    public function getIntegration(): ?Integration
    {
        return $this->integration;
    }

    public function setIntegration(?Integration $integration): static
    {
        $this->integration = $integration;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }
}
