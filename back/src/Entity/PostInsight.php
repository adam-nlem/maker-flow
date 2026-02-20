<?php

namespace App\Entity;

use App\Entity\User;
use App\Helper\DateHelper;
use App\Entity\Enum\InsightValueFormat;
use App\Entity\Enum\PostInsightType;
use App\Repository\PostInsightRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PostInsightRepository::class)]
#[ORM\HasLifecycleCallbacks]
class PostInsight
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_posts_list', 'api_post_insights_detail'])]
    private ?string $uuid = null;

    #[ORM\Column]
    #[Groups(['api_posts_list', 'api_post_insights_detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['api_posts_list', 'api_post_insights_detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(enumType: PostInsightType::class)]
    #[Groups(['api_posts_list', 'api_post_insights_detail'])]
    private ?PostInsightType $type = null;

    #[ORM\Column(type: Types::FLOAT)]
    #[Groups(['api_posts_list', 'api_post_insights_detail'])]
    private ?float $value = null;

    #[ORM\Column(enumType: InsightValueFormat::class)]
    #[Groups(['api_posts_list', 'api_post_insights_detail'])]
    private ?InsightValueFormat $valueFormat = null;

    #[ORM\ManyToOne(targetEntity: Post::class, inversedBy: 'postInsights')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Post $post = null;

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

    public function getType(): ?PostInsightType
    {
        return $this->type;
    }

    public function setType(PostInsightType $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(float $value): static
    {
        $this->value = $value;
        return $this;
    }

    public function getValueFormat(): ?InsightValueFormat
    {
        return $this->valueFormat;
    }

    public function setValueFormat(InsightValueFormat $valueFormat): static
    {
        $this->valueFormat = $valueFormat;
        return $this;
    }

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(?Post $post): static
    {
        $this->post = $post;
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
