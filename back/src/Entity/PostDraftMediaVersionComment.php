<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\PostDraftMediaVersionCommentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PostDraftMediaVersionCommentRepository::class)]
class PostDraftMediaVersionComment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $uuid = null;

    #[ORM\ManyToOne(inversedBy: 'comments')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?PostDraftMediaVersion $mediaVersion = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?User $author = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $body = null;

    #[ORM\Column]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
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

    public function getMediaVersion(): ?PostDraftMediaVersion
    {
        return $this->mediaVersion;
    }

    public function setMediaVersion(?PostDraftMediaVersion $mediaVersion): static
    {
        $this->mediaVersion = $mediaVersion;

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
