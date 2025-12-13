<?php

namespace App\Module\TodoList\Entity;

use App\Entity\Enum\Color;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\TodoList\Repository\TodoListTagRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints as ORMAssert;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: TodoListTagRepository::class)]
#[ORMAssert\UniqueEntity('title', 'todoList', 'user')]
#[ORM\HasLifecycleCallbacks]
class TodoListTag
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_modules_todo_lists_tags_list',
        'api_modules_todo_lists_tags_create',
        'api_modules_todo_lists_tasks_create',
        'api_modules_todo_lists_tags_update'
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_modules_todo_lists_tags_list',
        'api_modules_todo_lists_tags_create',
        'api_modules_todo_lists_tasks_create',
        'api_modules_todo_lists_tags_update'
    ])]
    private ?string $title = null;

    #[ORM\Column(enumType: Color::class)]
    #[Groups([
        'api_modules_todo_lists_tags_list',
        'api_modules_todo_lists_tags_create',
        'api_modules_todo_lists_tasks_create',
        'api_modules_todo_lists_tags_update'
    ])]
    private ?Color $color = null;

    #[ORM\Column]
    #[Groups([
        'api_modules_todo_lists_tags_list',
        'api_modules_todo_lists_tags_create',
        'api_modules_todo_lists_tasks_create',
        'api_modules_todo_lists_tags_update'
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_modules_todo_lists_tags_list',
        'api_modules_todo_lists_tags_create',
        'api_modules_todo_lists_tasks_create',
        'api_modules_todo_lists_tags_update'
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, TodoListTask>
     */
    #[ORM\ManyToMany(targetEntity: TodoListTask::class, mappedBy: 'tags')]
    private Collection $todoItems;

    #[ORM\ManyToOne(inversedBy: 'todoListTags')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'todoListTags')]
    #[ORM\JoinColumn(nullable: false)]
    private ?TodoList $todoList = null;

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
     * @return Collection<int, TodoListTask>
     */
    public function getTodoListTasks(): Collection
    {
        return $this->todoItems;
    }

    public function addTodoListTask(TodoListTask $todoItem): static
    {
        if (!$this->todoItems->contains($todoItem)) {
            $this->todoItems->add($todoItem);
            $todoItem->addTag($this);
        }

        return $this;
    }

    public function removeTodoListTask(TodoListTask $todoItem): static
    {
        if ($this->todoItems->removeElement($todoItem)) {
            $todoItem->removeTag($this);
        }

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

    public function getTodoList(): ?TodoList
    {
        return $this->todoList;
    }

    public function setTodoList(?TodoList $todoList): static
    {
        $this->todoList = $todoList;

        return $this;
    }
}
