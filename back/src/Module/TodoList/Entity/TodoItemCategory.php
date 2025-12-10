<?php

namespace App\Module\TodoList\Entity;

use App\Entity\Enum\Color;
use App\Helper\DateHelper;
use App\Module\TodoList\Repository\TodoItemCategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: TodoItemCategoryRepository::class)]
#[ORM\HasLifecycleCallbacks]
class TodoItemCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(enumType: Color::class)]
    private ?Color $color = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, TodoItem>
     */
    #[ORM\ManyToMany(targetEntity: TodoItem::class, mappedBy: 'categories')]
    private Collection $todoItems;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }
        $this->todoItems = new ArrayCollection();
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

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection<int, TodoItem>
     */
    public function getTodoItems(): Collection
    {
        return $this->todoItems;
    }

    public function addTodoItem(TodoItem $todoItem): static
    {
        if (!$this->todoItems->contains($todoItem)) {
            $this->todoItems->add($todoItem);
            $todoItem->addCategory($this);
        }

        return $this;
    }

    public function removeTodoItem(TodoItem $todoItem): static
    {
        if ($this->todoItems->removeElement($todoItem)) {
            $todoItem->removeCategory($this);
        }

        return $this;
    }
}
