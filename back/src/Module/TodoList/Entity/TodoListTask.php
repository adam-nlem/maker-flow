<?php

namespace App\Module\TodoList\Entity;

use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\TodoList\Entity\Enum\TodoListPriority;
use App\Module\TodoList\Entity\Enum\TodoListStatus;
use App\Module\TodoList\Repository\TodoListTaskRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: TodoListTaskRepository::class)]
#[ORM\HasLifecycleCallbacks]
class TodoListTask
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_modules_todo_lists_tasks_create'
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?string $content = null;

    #[ORM\Column(enumType: TodoListStatus::class)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?TodoListStatus $status = null;

    #[ORM\Column(nullable: true, enumType: TodoListPriority::class)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?TodoListPriority $priority = null;

    #[ORM\Column]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?\DateTimeImmutable $finishedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private ?\DateTimeImmutable $dueDate = null;

    /**
     * @var Collection<int, TodoListTag>
     */
    #[ORM\ManyToMany(targetEntity: TodoListTag::class, inversedBy: 'todoItems')]
    #[Groups([

        'api_modules_todo_lists_tasks_create'
    ])]
    private Collection $tags;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'todoListTasks')]
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
        $this->tags = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        //TODO: Check status and update the finishedAt accordingly
        //TODO: status === completed -> finishedAt = now utc
        //TODO: else -> finishedAt = null
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

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getStatus(): ?TodoListStatus
    {
        return $this->status;
    }

    public function setStatus(TodoListStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getPriority(): ?TodoListPriority
    {
        return $this->priority;
    }

    public function setPriority(?TodoListPriority $priority): static
    {
        $this->priority = $priority;

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

    public function getFinishedAt(): ?\DateTimeImmutable
    {
        return $this->finishedAt;
    }

    public function setFinishedAt(?\DateTimeImmutable $finishedAt): static
    {
        $this->finishedAt = $finishedAt;

        return $this;
    }

    public function getDueDate(): ?\DateTimeImmutable
    {
        return $this->dueDate;
    }

    public function setDueDate(?\DateTimeImmutable $dueDate): static
    {
        $this->dueDate = $dueDate;

        return $this;
    }

    /**
     * @return Collection<int, TodoListTag>
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(TodoListTag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
        }
        return $this;
    }

    public function removeTag(TodoListTag $tag): static
    {
        $this->tags->removeElement($tag);

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
