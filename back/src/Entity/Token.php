<?php

namespace App\Entity;

use App\Helper\DateHelper;
use App\Repository\TokenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TokenRepository::class)]
class Token
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $value = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\ManyToOne(inversedBy: 'tokens')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    public function __construct()
    {
        $this->resetToken();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): static
    {
        $this->value = $value;

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

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

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

    public function isExpired(): bool
    {
        return ($this->getExpiresAt() < DateHelper::createUtcDateTimeImmutable());
    }


    private function resetValue()
    {
        $this->value = uniqid() . bin2hex(random_bytes(5));
    }

    private function resetCreatedAt()
    {
        $this->createdAt = DateHelper::createUtcDateTimeImmutable();
    }

    public function resetExpiresAt(): void
    {
        $dateTime = DateHelper::createUtcDateTimeImmutable();
        // DateTimeImmutable returns a new instance when modified, so we need to capture the result
        $dateTime = $dateTime->modify('+1 day');

        $this->expiresAt = $dateTime;
    }

    public function resetToken()
    {
        $this->resetValue();
        $this->resetCreatedAt();
        $this->resetExpiresAt();
    }
}
