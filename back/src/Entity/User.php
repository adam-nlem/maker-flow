<?php

namespace App\Entity;

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
    public const ROLE_USER = 'ROLE_USER';
    public const ROLE_ADMIN = 'ROLE_ADMIN';

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
        'api_otp_verify_prelaunch'
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch'
    ])]
    private ?string $firstName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'api_user_register',
        'api_user_me',
        'api_user_update',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_verify_prelaunch'
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
        'api_otp_verify_prelaunch'
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
        'api_otp_verify_prelaunch'
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::JSON)]
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

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups([
        'api_user_me',
        'api_user_update'
    ])]
    private ?string $stripeCustomerId = null;

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

    /**
     * @var Collection<int, Token>
     */
    #[ORM\OneToMany(targetEntity: Token::class, mappedBy: 'user', cascade: ['remove'], orphanRemoval: true)]
    private Collection $tokens;

    /**
     * @var Collection<int, Integration>
     */
    #[ORM\OneToMany(targetEntity: Integration::class, mappedBy: 'user', cascade: ['remove'], orphanRemoval: true)]
    private Collection $integrations;

    /**
     * @var Collection<int, Project>
     */
    #[ORM\OneToMany(targetEntity: Project::class, mappedBy: 'user', cascade: ['remove'], orphanRemoval: true)]
    private Collection $projects;

    #[ORM\OneToOne(targetEntity: CreditBalance::class, mappedBy: 'user', cascade: ['remove'])]
    private ?CreditBalance $creditBalance = null;

    /**
     * @var Collection<int, Subscription>
     */
    #[ORM\OneToMany(targetEntity: Subscription::class, mappedBy: 'user', cascade: ['remove'])]
    private Collection $subscriptions;

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

        $this->addRole(self::ROLE_USER);

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->tokens = new ArrayCollection();
        $this->integrations = new ArrayCollection();
        $this->projects = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
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

    public function addRole(string $role): static
    {
        if (!in_array($role, $this->roles)) {
            $this->roles[] = $role;
        }
        return $this;
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

    public function getStripeCustomerId(): ?string
    {
        return $this->stripeCustomerId;
    }

    public function setStripeCustomerId(?string $stripeCustomerId): static
    {
        $this->stripeCustomerId = $stripeCustomerId;

        return $this;
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

    /**
     * @return Collection<int, Integration>
     */
    public function getIntegrations(): Collection
    {
        return $this->integrations;
    }

    public function addIntegration(Integration $integration): static
    {
        if (!$this->integrations->contains($integration)) {
            $this->integrations->add($integration);
            $integration->setUser($this);
        }

        return $this;
    }

    public function removeIntegration(Integration $integration): static
    {
        if ($this->integrations->removeElement($integration)) {
            // set the owning side to null (unless already changed)
            if ($integration->getUser() === $this) {
                $integration->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Project>
     */
    public function getProjects(): Collection
    {
        return $this->projects;
    }

    public function addProject(Project $project): static
    {
        if (!$this->projects->contains($project)) {
            $this->projects->add($project);
            $project->setUser($this);
        }

        return $this;
    }

    public function removeProject(Project $project): static
    {
        if ($this->projects->removeElement($project)) {
            // set the owning side to null (unless already changed)
            if ($project->getUser() === $this) {
                $project->setUser(null);
            }
        }

        return $this;
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

    /**
     * @return Collection<int, Subscription>
     */
    public function getSubscriptions(): Collection
    {
        return $this->subscriptions;
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
