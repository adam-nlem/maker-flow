<?php

namespace App\Entity;

use App\Entity\Enum\CreditTransactionType;
use App\Entity\Enum\SourceBucket;
use App\Helper\DateHelper;
use App\Repository\CreditTransactionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: CreditTransactionRepository::class)]
class CreditTransaction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID, unique: true)]
    #[Groups(['api_credit_transactions_list'])]
    private ?string $uuid = null;

    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['api_credit_transactions_list'])]
    private ?int $amount = null;

    #[ORM\Column(enumType: CreditTransactionType::class)]
    #[Groups(['api_credit_transactions_list'])]
    private ?CreditTransactionType $type = null;

    #[ORM\Column(enumType: SourceBucket::class)]
    #[Groups(['api_credit_transactions_list'])]
    private ?SourceBucket $sourceBucket = null;

    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['api_credit_transactions_list'])]
    private ?int $balanceAfter = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['api_credit_transactions_list'])]
    private ?string $stripePaymentIntentId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['api_credit_transactions_list'])]
    private ?string $stripeInvoiceId = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_credit_transactions_list'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['api_credit_transactions_list'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'creditTransactions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?CreditBalance $creditBalance = null;

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

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getType(): ?CreditTransactionType
    {
        return $this->type;
    }

    public function setType(CreditTransactionType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getSourceBucket(): ?SourceBucket
    {
        return $this->sourceBucket;
    }

    public function setSourceBucket(SourceBucket $sourceBucket): static
    {
        $this->sourceBucket = $sourceBucket;

        return $this;
    }

    public function getBalanceAfter(): ?int
    {
        return $this->balanceAfter;
    }

    public function setBalanceAfter(int $balanceAfter): static
    {
        $this->balanceAfter = $balanceAfter;

        return $this;
    }

    public function getStripePaymentIntentId(): ?string
    {
        return $this->stripePaymentIntentId;
    }

    public function setStripePaymentIntentId(?string $stripePaymentIntentId): static
    {
        $this->stripePaymentIntentId = $stripePaymentIntentId;

        return $this;
    }

    public function getStripeInvoiceId(): ?string
    {
        return $this->stripeInvoiceId;
    }

    public function setStripeInvoiceId(?string $stripeInvoiceId): static
    {
        $this->stripeInvoiceId = $stripeInvoiceId;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

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
}
