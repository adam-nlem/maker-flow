<?php

namespace App\Entity;

use App\Entity\Enum\ReviewStatus;
use App\Entity\Enum\VideoStreamingFailureReason;
use App\Entity\Enum\VideoStreamingStatus;
use App\Helper\DateHelper;
use App\Repository\ReviewVersionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ReviewVersionRepository::class)]
class ReviewVersion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_reviews_list',
        'api_review_comments_pending',
        'api_reviews_show',
        'api_reviews_create',
        'api_reviews_update',
        'api_review_versions_approve',
        'api_review_versions_create',
        'api_review_comments_create',
        'api_review_comments_update',
    ])]
    private ?string $uuid = null;

    #[ORM\ManyToOne(inversedBy: 'versions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Review $review = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups([
        'api_reviews_list',
        'api_review_comments_pending',
        'api_reviews_show',
        'api_reviews_create',
        'api_reviews_update',
        'api_review_versions_approve',
        'api_review_versions_create',
        'api_review_comments_create',
        'api_review_comments_update',
    ])]
    private int $fileCount = 1;

    #[ORM\Column(length: 32, enumType: ReviewStatus::class)]
    #[Groups([
        'api_reviews_list',
        'api_review_comments_pending',
        'api_reviews_show',
        'api_reviews_create',
        'api_reviews_update',
        'api_review_versions_approve',
        'api_review_versions_create',
        'api_review_comments_create',
        'api_review_comments_update',
    ])]
    private ReviewStatus $status = ReviewStatus::Pending;

    #[ORM\Column(type: 'string', length: 32, nullable: true, enumType: VideoStreamingStatus::class)]
    #[Groups([
        'api_reviews_list',
        'api_review_comments_pending',
        'api_reviews_show',
        'api_reviews_create',
        'api_reviews_update',
        'api_review_versions_approve',
        'api_review_versions_create',
        'api_review_comments_create',
        'api_review_comments_update',
    ])]
    private ?VideoStreamingStatus $videoStreamingStatus = null;

    #[ORM\Column(type: 'string', length: 32, nullable: true, enumType: VideoStreamingFailureReason::class)]
    #[Groups([
        'api_reviews_list',
        'api_review_comments_pending',
        'api_reviews_show',
        'api_reviews_create',
        'api_reviews_update',
        'api_review_versions_approve',
        'api_review_versions_create',
        'api_review_comments_create',
        'api_review_comments_update',
    ])]
    private ?VideoStreamingFailureReason $videoStreamingFailureReason = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $durationSeconds = null;

    #[ORM\Column(type: Types::BIGINT, nullable: true)]
    private ?int $fileSizeBytes = null;

    #[ORM\Column]
    #[Groups([
        'api_reviews_show',
        'api_reviews_create',
        'api_reviews_update',
        'api_review_versions_approve',
        'api_review_versions_create',
        'api_review_comments_create',
        'api_review_comments_update',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, ReviewComment>
     */
    #[ORM\OneToMany(targetEntity: ReviewComment::class, mappedBy: 'reviewVersion', cascade: ['remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    private Collection $comments;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->comments = new ArrayCollection();
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

    public function getReview(): ?Review
    {
        return $this->review;
    }

    public function setReview(?Review $review): static
    {
        $this->review = $review;

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

    public function getStatus(): ReviewStatus
    {
        return $this->status;
    }

    public function setStatus(ReviewStatus $status): static
    {
        $this->status = $status;

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

    public function getDurationSeconds(): ?int
    {
        return $this->durationSeconds;
    }

    public function setDurationSeconds(?int $durationSeconds): static
    {
        $this->durationSeconds = $durationSeconds;

        return $this;
    }

    public function getFileSizeBytes(): ?int
    {
        return $this->fileSizeBytes !== null ? (int) $this->fileSizeBytes : null;
    }

    public function setFileSizeBytes(?int $fileSizeBytes): static
    {
        $this->fileSizeBytes = $fileSizeBytes;

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

    /**
     * @return Collection<int, ReviewComment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(ReviewComment $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setReviewVersion($this);
        }

        return $this;
    }

    public function removeComment(ReviewComment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            if ($comment->getReviewVersion() === $this) {
                $comment->setReviewVersion(null);
            }
        }

        return $this;
    }
}
