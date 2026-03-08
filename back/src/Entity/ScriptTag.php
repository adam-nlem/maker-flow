<?php

namespace App\Entity;

use App\Entity\Enum\Color;
use App\Helper\DateHelper;
use App\Repository\ScriptTagRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints as ORMAssert;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ScriptTagRepository::class)]
#[ORMAssert\UniqueEntity(fields: ['title', 'project', 'user'])]
#[ORM\HasLifecycleCallbacks]
class ScriptTag
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_scripts_tags_list',
        'api_scripts_tags_create',
        'api_scripts_tags_update',

        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_scripts_tags_list',
        'api_scripts_tags_create',
        'api_scripts_tags_update',

        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?string $title = null;

    #[ORM\Column(enumType: Color::class)]
    #[Groups([
        'api_scripts_tags_list',
        'api_scripts_tags_create',
        'api_scripts_tags_update',

        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?Color $color = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_tags_list',
        'api_scripts_tags_create',
        'api_scripts_tags_update',

        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups([
        'api_scripts_tags_list',
        'api_scripts_tags_create',
        'api_scripts_tags_update',

        'api_scripts_list',
        'api_scripts_calendar',
        'api_scripts_create',
        'api_scripts_update',
        'api_scripts_show',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'scriptTags')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Project $project = null;

    /**
     * @var Collection<int, Script>
     */
    #[ORM\ManyToMany(targetEntity: Script::class, mappedBy: 'tags')]
    private Collection $scripts;

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

        $this->scripts = new ArrayCollection();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getColor(): ?Color
    {
        return $this->color;
    }

    public function setColor(Color $color): static
    {
        $this->color = $color;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

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
     * @return Collection<int, Script>
     */
    public function getScripts(): Collection
    {
        return $this->scripts;
    }

    public function addScript(Script $script): static
    {
        if (!$this->scripts->contains($script)) {
            $this->scripts->add($script);
            $script->addTag($this);
        }

        return $this;
    }

    public function removeScript(Script $script): static
    {
        if ($this->scripts->removeElement($script)) {
            $script->removeTag($this);
        }

        return $this;
    }
}
