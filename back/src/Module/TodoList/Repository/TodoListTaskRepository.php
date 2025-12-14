<?php

namespace App\Module\TodoList\Repository;

use App\Entity\User;
use App\Module\TodoList\Entity\Enum\TodoListStatus;
use App\Module\TodoList\Entity\TodoList;
use App\Module\TodoList\Entity\TodoListTask;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<TodoListTask>
 */
class TodoListTaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TodoListTask::class);
    }

    public function save(TodoListTask $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TodoListTask $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?TodoListTask
    {
        return $this->createQueryBuilder('t')
            ->where('t.uuid = :uuid')
            ->andWhere('t.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByTodoListAndStatusAndUserPaginated(TodoList $todoList, TodoListStatus $status, User $user, int $page, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.user = :user')
            ->andWhere('t.todoList = :todoList')
            ->andWhere('t.status = :status')
            ->setParameter('user', $user)
            ->setParameter('todoList', $todoList)
            ->setParameter('status', $status)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->addOrderBy(
                'CASE WHEN t.updatedAt IS NOT NULL THEN t.updatedAt ELSE t.createdAt END',
                'DESC'
            )
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
