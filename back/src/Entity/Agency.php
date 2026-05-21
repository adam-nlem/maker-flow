<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\AgencyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AgencyRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Agency
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID, unique: true)]
    #[Groups(['api_agencies_create', 'api_agencies_update', 'api_agencies_current', 'api_users_me', 'api_projects_get_by_uuid', 'api_invitations_show', 'api_invitations_create', 'api_review_comments_list'])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_agencies_create', 'api_agencies_update', 'api_agencies_current', 'api_users_me', 'api_invitations_show', 'api_invitations_create', 'api_projects_get_by_uuid', 'api_review_comments_list'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Email]
    #[Groups(['api_agencies_create', 'api_agencies_update', 'api_agencies_current', 'api_users_me', 'api_projects_get_by_uuid', 'api_invitations_show', 'api_invitations_create'])]
    private ?string $contactEmail = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['api_agencies_create', 'api_agencies_update', 'api_agencies_current', 'api_users_me', 'api_projects_get_by_uuid', 'api_invitations_show', 'api_invitations_create'])]
    private ?string $website = null;

    #[ORM\Column(length: 255, unique: true, nullable: true)]
    private ?string $stripeCustomerId = null;

    #[ORM\Column]
    #[Groups(['api_agencies_create', 'api_agencies_update'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['api_agencies_create', 'api_agencies_update'])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\OneToMany(targetEntity: User::class, mappedBy: 'agency')]
    private Collection $collaborators;

    /**
     * @var Collection<int, Project>
     */
    #[ORM\OneToMany(targetEntity: Project::class, mappedBy: 'agency', cascade: ['remove'], orphanRemoval: true)]
    private Collection $projects;

    /**
     * @var Collection<int, Subscription>
     */
    #[ORM\OneToMany(targetEntity: Subscription::class, mappedBy: 'agency', cascade: ['remove'])]
    private Collection $subscriptions;

    #[ORM\OneToOne(targetEntity: CreditBalance::class, mappedBy: 'agency', cascade: ['remove'])]
    private ?CreditBalance $creditBalance = null;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        if ($this->updatedAt === null) {
            $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->collaborators = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }

    public function setContactEmail(?string $contactEmail): static
    {
        $this->contactEmail = $contactEmail;

        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;

        return $this;
    }

    public function getStripeCustomerId(): ?string
    {
        return $this->stripeCustomerId;
    }

    public function setStripeCustomerId(?string $stripeCustomerId): static
    {
        $this->stripeCustomerId = $stripeCustomerId;

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

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getCollaborators(): Collection
    {
        return $this->collaborators;
    }

    /**
     * @return Collection<int, Project>
     */
    public function getProjects(): Collection
    {
        return $this->projects;
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function getSubscriptions(): Collection
    {
        return $this->subscriptions;
    }

    public function getCreditBalance(): ?CreditBalance
    {
        return $this->creditBalance;
    }

    public function setCreditBalance(?CreditBalance $creditBalance): static
    {
        $this->creditBalance = $creditBalance;

        return $this;
    }
}
