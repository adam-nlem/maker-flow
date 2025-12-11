<?php

namespace App\Entity;

use App\Entity\Enum\ModuleIdentifier;
use App\Helper\DateHelper;
use App\Repository\ModuleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ModuleRepository::class)]
class Module
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID, unique: true)]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?bool $isActive = null;

    #[ORM\Column]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?bool $isPremium = null;

    #[ORM\Column]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(enumType: ModuleIdentifier::class)]
    #[Groups([
        'api_project_get_user_modules',
        'api_user_modules_create',
    ])]
    private ?ModuleIdentifier $moduleIdentifier = null;

    /**
     * @var Collection<int, UserModule>
     */
    #[ORM\OneToMany(targetEntity: UserModule::class, mappedBy: 'module')]
    private Collection $userModules;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->userModules = new ArrayCollection();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

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

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function isPremium(): ?bool
    {
        return $this->isPremium;
    }

    public function setIsPremium(bool $isPremium): static
    {
        $this->isPremium = $isPremium;

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

    public function getModuleIdentifier(): ?ModuleIdentifier
    {
        return $this->moduleIdentifier;
    }

    public function setModuleIdentifier(ModuleIdentifier $moduleIdentifier): static
    {
        $this->moduleIdentifier = $moduleIdentifier;

        return $this;
    }

    /**
     * @return Collection<int, UserModule>
     */
    public function getUserModules(): Collection
    {
        return $this->userModules;
    }

    public function addUserModule(UserModule $userModule): static
    {
        if (!$this->userModules->contains($userModule)) {
            $this->userModules->add($userModule);
            $userModule->setModule($this);
        }

        return $this;
    }

    public function removeUserModule(UserModule $userModule): static
    {
        if ($this->userModules->removeElement($userModule)) {
            // set the owning side to null (unless already changed)
            if ($userModule->getModule() === $this) {
                $userModule->setModule(null);
            }
        }

        return $this;
    }
}
