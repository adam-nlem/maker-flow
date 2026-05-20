<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\CreditBalanceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: CreditBalanceRepository::class)]
#[ORM\HasLifecycleCallbacks]
class CreditBalance
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID, unique: true)]
    #[Groups(['api_credits_balance_show'])]
    private ?string $uuid = null;

    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['api_credits_balance_show'])]
    private int $subscriptionCredits = 0;

    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['api_credits_balance_show'])]
    private int $refillCredits = 0;

    #[ORM\Column]
    #[Groups(['api_credits_balance_show'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['api_credits_balance_show'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToOne(targetEntity: Agency::class, inversedBy: 'creditBalance')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Agency $agency = null;

    /**
     * @var Collection<int, CreditTransaction>
     */
    #[ORM\OneToMany(targetEntity: CreditTransaction::class, mappedBy: 'creditBalance', cascade: ['remove'], orphanRemoval: true)]
    private Collection $creditTransactions;

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

        $this->creditTransactions = new ArrayCollection();
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

    public function getSubscriptionCredits(): int
    {
        return $this->subscriptionCredits;
    }

    public function setSubscriptionCredits(int $subscriptionCredits): static
    {
        $this->subscriptionCredits = $subscriptionCredits;

        return $this;
    }

    public function getRefillCredits(): int
    {
        return $this->refillCredits;
    }

    public function setRefillCredits(int $refillCredits): static
    {
        $this->refillCredits = $refillCredits;

        return $this;
    }

    public function getTotalCredits(): int
    {
        return $this->subscriptionCredits + $this->refillCredits;
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

    public function getAgency(): ?Agency
    {
        return $this->agency;
    }

    public function setAgency(?Agency $agency): static
    {
        $this->agency = $agency;

        return $this;
    }

    /**
     * @return Collection<int, CreditTransaction>
     */
    public function getCreditTransactions(): Collection
    {
        return $this->creditTransactions;
    }

    public function addCreditTransaction(CreditTransaction $creditTransaction): static
    {
        if (!$this->creditTransactions->contains($creditTransaction)) {
            $this->creditTransactions->add($creditTransaction);
            $creditTransaction->setCreditBalance($this);
        }

        return $this;
    }

    public function removeCreditTransaction(CreditTransaction $creditTransaction): static
    {
        if ($this->creditTransactions->removeElement($creditTransaction)) {
            if ($creditTransaction->getCreditBalance() === $this) {
                $creditTransaction->setCreditBalance(null);
            }
        }

        return $this;
    }
}
