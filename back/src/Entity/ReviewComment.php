<?php

namespace App\Entity;

use App\Entity\Enum\ReviewCommentStatus;
use App\Helper\DateHelper;
use App\Repository\ReviewCommentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ReviewCommentRepository::class)]
class ReviewComment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?string $uuid = null;

    #[ORM\ManyToOne(inversedBy: 'comments')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?ReviewVersion $reviewVersion = null;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'replies')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?ReviewComment $parentComment = null;

    /**
     * @var Collection<int, ReviewComment>
     */
    #[ORM\OneToMany(targetEntity: self::class, mappedBy: 'parentComment', cascade: ['remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private Collection $replies;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?User $author = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?string $body = null;

    #[ORM\Column(length: 32, enumType: ReviewCommentStatus::class)]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ReviewCommentStatus $status = ReviewCommentStatus::Open;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?float $videoTimecodeSeconds = null;

    #[ORM\Column]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->replies = new ArrayCollection();
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

    public function getReviewVersion(): ?ReviewVersion
    {
        return $this->reviewVersion;
    }

    public function setReviewVersion(?ReviewVersion $reviewVersion): static
    {
        $this->reviewVersion = $reviewVersion;

        return $this;
    }

    public function getParentComment(): ?ReviewComment
    {
        return $this->parentComment;
    }

    public function setParentComment(?ReviewComment $parentComment): static
    {
        $this->parentComment = $parentComment;

        return $this;
    }

    public function isTopLevel(): bool
    {
        return $this->parentComment === null;
    }

    /**
     * @return Collection<int, ReviewComment>
     */
    public function getReplies(): Collection
    {
        return $this->replies;
    }

    public function addReply(ReviewComment $reply): static
    {
        if (!$this->replies->contains($reply)) {
            $this->replies->add($reply);
            $reply->setParentComment($this);
        }

        return $this;
    }

    public function removeReply(ReviewComment $reply): static
    {
        if ($this->replies->removeElement($reply)) {
            if ($reply->getParentComment() === $this) {
                $reply->setParentComment(null);
            }
        }

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(string $body): static
    {
        $this->body = $body;

        return $this;
    }

    public function getStatus(): ReviewCommentStatus
    {
        return $this->status;
    }

    public function setStatus(ReviewCommentStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getVideoTimecodeSeconds(): ?float
    {
        return $this->videoTimecodeSeconds;
    }

    public function setVideoTimecodeSeconds(?float $videoTimecodeSeconds): static
    {
        $this->videoTimecodeSeconds = $videoTimecodeSeconds;

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
