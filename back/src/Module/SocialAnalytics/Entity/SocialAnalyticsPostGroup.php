<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Entity\User;
use App\Entity\UserModule;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostGroupRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsPostGroupRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsPostGroup
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
    private ?string $title = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?UserModule $userModule = null;

    /**
     * @var Collection<int, SocialAnalyticsPost>
     */
    #[ORM\OneToMany(targetEntity: SocialAnalyticsPost::class, mappedBy: 'socialAnalyticsPostGroup', cascade: ['remove'], orphanRemoval: true)]
    private Collection $posts;

    public function __construct()
    {
        if (null === $this->uuid) {
            $this->uuid = Uuid::v4();
        }

        if (null === $this->createdAt) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->posts = new ArrayCollection();
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

    public function setUuid(string $uuid): static
    {
        $this->uuid = $uuid;

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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

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

    public function getUserModule(): ?UserModule
    {
        return $this->userModule;
    }

    public function setUserModule(?UserModule $userModule): static
    {
        $this->userModule = $userModule;

        return $this;
    }

    /**
     * @return Collection<int, SocialAnalyticsPost>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(SocialAnalyticsPost $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setSocialAnalyticsPostGroup($this);
        }

        return $this;
    }

    public function removePost(SocialAnalyticsPost $post): static
    {
        if ($this->posts->removeElement($post)) {
            if ($post->getSocialAnalyticsPostGroup() === $this) {
                $post->setSocialAnalyticsPostGroup(null);
            }
        }

        return $this;
    }
}
