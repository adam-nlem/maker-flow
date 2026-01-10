<?php

namespace App\Module\TodoList\Entity;

use App\Entity\User;
use App\Entity\UserModule;
use App\Helper\DateHelper;
use App\Module\TodoList\Repository\TodoListRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TodoListRepository::class)]
#[ORM\HasLifecycleCallbacks]
class TodoList
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_modules_todo_lists_create',
        'api_modules_todo_lists_list',
        'api_modules_todo_lists_update',
    ])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups([
        'api_modules_todo_lists_create',
        'api_modules_todo_lists_list',
        'api_modules_todo_lists_update',
    ])]
    private ?string $title = null;

    #[ORM\Column]
    #[Groups([
        'api_modules_todo_lists_create',
        'api_modules_todo_lists_list',
        'api_modules_todo_lists_update',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_modules_todo_lists_create',
        'api_modules_todo_lists_list',
        'api_modules_todo_lists_update',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?UserModule $userModule = null;

    /**
     * @var Collection<int, TodoListTask>
     */
    #[ORM\OneToMany(targetEntity: TodoListTask::class, mappedBy: 'todoList', cascade: ['remove'], orphanRemoval: true)]

    #[Groups([
        'api_modules_todo_lists_create',
    ])]
    private Collection $todoListTasks;

    /**
     * @var Collection<int, TodoListTag>
     */
    #[ORM\OneToMany(targetEntity: TodoListTag::class, mappedBy: 'todoList', cascade: ['remove'], orphanRemoval: true)]
    private Collection $todoListTags;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }
        $this->todoListTasks = new ArrayCollection();
        $this->todoListTags = new ArrayCollection();
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

    public function getUserModule(): ?UserModule
    {
        return $this->userModule;
    }

    public function setUserModule(?UserModule $userModule): static
    {
        $this->userModule = $userModule;

        return $this;
    }

    /**
     * @return Collection<int, TodoListTask>
     */
    public function getTodoListTasks(): Collection
    {
        return $this->todoListTasks;
    }

    public function addTodoListTask(TodoListTask $todoListTask): static
    {
        if (!$this->todoListTasks->contains($todoListTask)) {
            $this->todoListTasks->add($todoListTask);
            $todoListTask->setTodoList($this);
        }

        return $this;
    }

    public function removeTodoListTask(TodoListTask $todoListTask): static
    {
        if ($this->todoListTasks->removeElement($todoListTask)) {
            // set the owning side to null (unless already changed)
            if ($todoListTask->getTodoList() === $this) {
                $todoListTask->setTodoList(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, TodoListTag>
     */
    public function getTodoListTags(): Collection
    {
        return $this->todoListTags;
    }

    public function addTodoListTag(TodoListTag $todoListTag): static
    {
        if (!$this->todoListTags->contains($todoListTag)) {
            $this->todoListTags->add($todoListTag);
            $todoListTag->setTodoList($this);
        }

        return $this;
    }

    public function removeTodoListTag(TodoListTag $todoListTag): static
    {
        if ($this->todoListTags->removeElement($todoListTag)) {
            // set the owning side to null (unless already changed)
            if ($todoListTag->getTodoList() === $this) {
                $todoListTag->setTodoList(null);
            }
        }

        return $this;
    }
}
