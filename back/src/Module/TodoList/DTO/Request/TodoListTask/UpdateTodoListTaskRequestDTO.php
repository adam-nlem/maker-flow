<?php

namespace App\Module\TodoList\DTO\Request\TodoListTask;

use App\DTO\Request\AbstractRequestDTO;
use App\Module\TodoList\Entity\Enum\TodoListPriority;
use App\Module\TodoList\Entity\Enum\TodoListStatus;
use App\Module\TodoList\Entity\TodoListTask;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateTodoListTaskRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    private ?string $content;
    private ?TodoListPriority $priority;
    private ?TodoListStatus $status;
    private ?\DateTimeImmutable $dueDate;
    /** @var string[] */
    private array $tagUuids;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
        $this->content = $payload["content"] ?? null;
        $this->priority = TodoListPriority::tryFrom($payload["priority"] ?? "");
        $this->status = TodoListStatus::tryFrom($payload["status"] ?? "");
        $this->dueDate = isset($payload["dueDate"]) ? new \DateTimeImmutable($payload["dueDate"]) : null;
        $this->tagUuids = $payload["tagUuids"] ?? [];
    }

    protected function buildObject(): TodoListTask
    {
        $task = new TodoListTask();

        return $task
            ->setTitle($this->getTitle())
            ->setContent($this->getContent())
            ->setPriority($this->getPriority())
            ->setStatus($this->getStatus() ?? TodoListStatus::Pending)
            ->setDueDate($this->getDueDate());
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getPriority(): ?TodoListPriority
    {
        return $this->priority;
    }

    public function getStatus(): ?TodoListStatus
    {
        return $this->status;
    }

    public function getDueDate(): ?\DateTimeImmutable
    {
        return $this->dueDate;
    }

    /**
     * @return string[]
     */
    public function getTagUuids(): array
    {
        return $this->tagUuids;
    }
}
