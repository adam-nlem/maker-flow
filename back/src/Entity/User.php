<?php

namespace App\Entity;

use App\Entity\Enum\UserRole;
use App\Helper\DateHelper;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints as ORMAssert;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORMAssert\UniqueEntity('email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID, unique: true)]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch',
        'api_collaborators_list',
        'api_clients_list',
        'api_invitation_show',
        'api_invitation_create',
        'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch',
        'api_collaborators_list',
        'api_clients_list',
        'api_invitation_show',
        'api_invitation_create',
        'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create',
    ])]
    private ?string $firstName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch',
        'api_collaborators_list',
        'api_clients_list',
        'api_invitation_show',
        'api_invitation_create',
        'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create',
    ])]
    private ?string $lastName = null;

    #[ORM\Column(length: 255)]
    #[Assert\Email]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch',
        'api_collaborators_list',
        'api_clients_list',
        'api_invitation_show',
        'api_invitation_create',
        'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create',
    ])]
    private ?string $email = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $password = null;

    #[ORM\Column]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch',
        'api_invitation_show',
        'api_invitation_create',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups([
        'api_user_me',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch',
        'api_collaborators_list',
    ])]
    private array $roles = [];

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_login',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch'
    ])]
    private ?\DateTimeImmutable $verifiedAt = null;

    #[ORM\Column(length: 8, unique: true, nullable: true)]
    #[Groups([
        'api_user_me',
        'api_otp_verify_prelaunch'
    ])]
    private ?string $referralCode = null;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'referrals')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?self $referredBy = null;

    /**
     * @var Collection<int, self>
     */
    #[ORM\OneToMany(targetEntity: self::class, mappedBy: 'referredBy')]
    private Collection $referrals;

    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\ManyToOne(targetEntity: Agency::class, inversedBy: 'collaborators')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups([
        'api_user_me',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create',
    ])]
    private ?Agency $agency = null;

    #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'clientUsers')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups([
        'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create',
    ])]
    private ?Project $project = null;

    /**
     * @var Collection<int, Token>
     */
    #[ORM\OneToMany(targetEntity: Token::class, mappedBy: 'user', cascade: ['remove'], orphanRemoval: true)]
    private Collection $tokens;

    #[ORM\OneToOne(targetEntity: Onboarding::class, mappedBy: 'user', cascade: ['remove'])]
    private ?Onboarding $onboarding = null;

    /**
     * @var Collection<int, Otp>
     */
    #[ORM\OneToMany(targetEntity: Otp::class, mappedBy: 'user', cascade: ['remove'], orphanRemoval: true)]
    private Collection $otps;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        $this->addRole(UserRole::User->value);

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->tokens = new ArrayCollection();
        $this->otps = new ArrayCollection();
        $this->referrals = new ArrayCollection();
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

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

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

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function setRole(UserRole $role): static
    {
        $this->roles = [UserRole::User->value];

        if ($role !== UserRole::User) {
            $this->roles[] = $role->value;
        }

        return $this;
    }

    public function addRole(string $role): static
    {
        if (!in_array($role, $this->roles)) {
            $this->roles[] = $role;
        }
        return $this;
    }

    public function hasRole(UserRole $role): bool
    {
        return in_array($role->value, $this->roles, true);
    }

    public function getVerifiedAt(): ?\DateTimeImmutable
    {
        return $this->verifiedAt;
    }

    public function setVerifiedAt(?\DateTimeImmutable $verifiedAt): static
    {
        $this->verifiedAt = $verifiedAt;

        return $this;
    }

    public function isVerified(): bool
    {
        return $this->verifiedAt !== null;
    }

    public function getReferralCode(): ?string
    {
        return $this->referralCode;
    }

    public function setReferralCode(?string $referralCode): static
    {
        $this->referralCode = $referralCode;

        return $this;
    }

    public function getReferredBy(): ?self
    {
        return $this->referredBy;
    }

    public function setReferredBy(?self $referredBy): static
    {
        $this->referredBy = $referredBy;

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getReferrals(): Collection
    {
        return $this->referrals;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): static
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    public function isPrelaunchSubscriber(): bool
    {
        return $this->referralCode !== null && $this->password === null;
    }

    /**
     * @return Collection<int, Token>
     */
    public function getTokens(): Collection
    {
        return $this->tokens;
    }

    public function addToken(Token $token): static
    {
        if (!$this->tokens->contains($token)) {
            $this->tokens->add($token);
            $token->setUser($this);
        }

        return $this;
    }

    public function removeToken(Token $token): static
    {
        if ($this->tokens->removeElement($token)) {
            // set the owning side to null (unless already changed)
            if ($token->getUser() === $this) {
                $token->setUser(null);
            }
        }

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->getEmail();
    }

    public function eraseCredentials(): void
    {
        // TODO: Implement eraseCredentials() method.
    }

    public function getAgency(): ?Agency
    {
        return $this->agency;
    }

    public function setAgency(?Agency $agency): static
    {
        $this->agency = $agency;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    /**
     * @return Collection<int, Otp>
     */
    public function getOtps(): Collection
    {
        return $this->otps;
    }

    public function getOnboarding(): ?Onboarding
    {
        return $this->onboarding;
    }

    public function setOnboarding(?Onboarding $onboarding): static
    {
        $this->onboarding = $onboarding;

        return $this;
    }
}
