<?php

namespace App\Entity;

use App\Entity\Enum\PostDraftStatus;
use App\Entity\Enum\VideoStreamingFailureReason;
use App\Entity\Enum\VideoStreamingStatus;
use App\Helper\DateHelper;
use App\Repository\PostDraftMediaVersionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $uuid = null;

    #[ORM\ManyToOne(inversedBy: 'mediaVersions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?PostDraft $postDraft = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private int $fileCount = 1;

    #[ORM\Column(length: 32, enumType: PostDraftStatus::class)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private PostDraftStatus $status = PostDraftStatus::AwaitingReview;

    #[ORM\Column(type: 'string', length: 32, nullable: true, enumType: VideoStreamingStatus::class)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?VideoStreamingStatus $videoStreamingStatus = null;

    #[ORM\Column(type: 'string', length: 32, nullable: true, enumType: VideoStreamingFailureReason::class)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?VideoStreamingFailureReason $videoStreamingFailureReason = null;

    #[ORM\Column]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, PostDraftMediaVersionComment>
     */
    #[ORM\OneToMany(targetEntity: PostDraftMediaVersionComment::class, mappedBy: 'mediaVersion', cascade: ['remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
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

    public function getStatus(): PostDraftStatus
    {
        return $this->status;
    }

    public function setStatus(PostDraftStatus $status): static
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
     * @return Collection<int, PostDraftMediaVersionComment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(PostDraftMediaVersionComment $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setMediaVersion($this);
        }

        return $this;
    }

    public function removeComment(PostDraftMediaVersionComment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            if ($comment->getMediaVersion() === $this) {
                $comment->setMediaVersion(null);
            }
        }

        return $this;
    }
}
