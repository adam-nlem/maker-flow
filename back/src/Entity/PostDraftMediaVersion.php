<?php

namespace App\Entity;

use App\Entity\Enum\VideoStreamingFailureReason;
use App\Entity\Enum\VideoStreamingStatus;
use App\Helper\DateHelper;
use App\Repository\PostDraftMediaVersionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PostDraftMediaVersionRepository::class)]
class PostDraftMediaVersion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show'])]
    private ?string $uuid = null;

    #[ORM\ManyToOne(inversedBy: 'mediaVersions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?PostDraft $postDraft = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show'])]
    private int $fileCount = 1;

    #[ORM\Column(type: 'string', length: 32, nullable: true, enumType: VideoStreamingStatus::class)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show'])]
    private ?VideoStreamingStatus $videoStreamingStatus = null;

    #[ORM\Column(type: 'string', length: 32, nullable: true, enumType: VideoStreamingFailureReason::class)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show'])]
    private ?VideoStreamingFailureReason $videoStreamingFailureReason = null;

    #[ORM\Column]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function setUuid(string $uuid): static
    {
        $this->uuid = $uuid;

        return $this;
    }

    public function getPostDraft(): ?PostDraft
    {
        return $this->postDraft;
    }

    public function setPostDraft(?PostDraft $postDraft): static
    {
        $this->postDraft = $postDraft;

        return $this;
    }

    public function getFileCount(): int
    {
        return $this->fileCount;
    }

    public function setFileCount(int $fileCount): static
    {
        $this->fileCount = $fileCount;

        return $this;
    }

    public function getVideoStreamingStatus(): ?VideoStreamingStatus
    {
        return $this->videoStreamingStatus;
    }

    public function setVideoStreamingStatus(?VideoStreamingStatus $videoStreamingStatus): static
    {
        $this->videoStreamingStatus = $videoStreamingStatus;

        return $this;
    }

    public function getVideoStreamingFailureReason(): ?VideoStreamingFailureReason
    {
        return $this->videoStreamingFailureReason;
    }

    public function setVideoStreamingFailureReason(?VideoStreamingFailureReason $videoStreamingFailureReason): static
    {
        $this->videoStreamingFailureReason = $videoStreamingFailureReason;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
