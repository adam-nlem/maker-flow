<?php

namespace App\Entity;

use App\Entity\Enum\ProjectType;
use App\Helper\DateHelper;
use App\Repository\ProjectRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Bridge\Doctrine\Validator\Constraints as ORMAssert;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
#[ORMAssert\UniqueEntity(fields: ['name', 'agency'])]
#[ORM\HasLifecycleCallbacks]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen',
        'api_invitations_show',
        'api_invitations_create',
        'api_review_comments_list',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen',
        'api_invitations_show',
        'api_invitations_create',
        'api_review_comments_list',
    ])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen',
        'api_invitations_show',
        'api_invitations_create',
    ])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen',
        'api_invitations_show',
        'api_invitations_create',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen'
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen'
    ])]
    private ?\DateTimeImmutable $finishedAt = null;

    #[ORM\Column(type: Types::SIMPLE_ARRAY, enumType: ProjectType::class, nullable: true)]
    #[Groups([
        'api_projects_create',
        'api_projects_update',
        'api_projects_get_paginated',
        'api_projects_get_by_uuid',
        'api_projects_finish',
        'api_projects_reopen',
        'api_invitations_show',
        'api_invitations_create',
    ])]
    private array $types = [];

    #[ORM\ManyToOne(targetEntity: Agency::class, inversedBy: 'projects')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['api_projects_get_by_uuid'])]
    private ?Agency $agency = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\OneToMany(targetEntity: User::class, mappedBy: 'project')]
    private Collection $clientUsers;

    /**
     * @var Collection<int, TodoList>
     */
    #[ORM\OneToMany(targetEntity: TodoList::class, mappedBy: 'project', cascade: ['remove'], orphanRemoval: true)]
    private Collection $todoLists;

    /**
     * @var Collection<int, Integration>
     */
    #[ORM\OneToMany(targetEntity: Integration::class, mappedBy: 'project', cascade: ['remove'], orphanRemoval: true)]
    private Collection $integrations;

    /**
     * @var Collection<int, Script>
     */
    #[ORM\OneToMany(targetEntity: Script::class, mappedBy: 'project', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scripts;

    /**
     * @var Collection<int, ScriptTag>
     */
    #[ORM\OneToMany(targetEntity: ScriptTag::class, mappedBy: 'project', cascade: ['remove'], orphanRemoval: true)]
    private Collection $scriptTags;

    /**
     * @var Collection<int, Review>
     */
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'project', cascade: ['remove'], orphanRemoval: true)]
    private Collection $reviews;

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
        $this->clientUsers = new ArrayCollection();
        $this->todoLists = new ArrayCollection();
        $this->integrations = new ArrayCollection();
        $this->scripts = new ArrayCollection();
        $this->scriptTags = new ArrayCollection();
        $this->reviews = new ArrayCollection();
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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getFinishedAt(): ?\DateTimeImmutable
    {
        return $this->finishedAt;
    }

    public function setFinishedAt(?\DateTimeImmutable $finishedAt): static
    {
        $this->finishedAt = $finishedAt;

        return $this;
    }

    /**
     * @return ProjectType[]
     */
    public function getTypes(): array
    {
        return $this->types;
    }

    public function setTypes(array $types): static
    {
        $this->types = $types;

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
     * @return Collection<int, User>
     */
    public function getClientUsers(): Collection
    {
        return $this->clientUsers;
    }

    /**
     * @return Collection<int, TodoList>
     */
    public function getTodoLists(): Collection
    {
        return $this->todoLists;
    }

    /**
     * @return Collection<int, Integration>
     */
    public function getIntegrations(): Collection
    {
        return $this->integrations;
    }

    /**
     * @return Collection<int, Script>
     */
    public function getScripts(): Collection
    {
        return $this->scripts;
    }

    /**
     * @return Collection<int, ScriptTag>
     */
    public function getScriptTags(): Collection
    {
        return $this->scriptTags;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviews(): Collection
    {
        return $this->reviews;
    }
}
