<?php

namespace App\Repository;

use App\Entity\Enum\TodoListStatus;
use App\Entity\TodoList;
use App\Entity\TodoListTask;
use App\Entity\User;
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

    public function removeByTodoList(TodoList $todoList): void
    {
        $this->createQueryBuilder('t')
            ->delete()
            ->where('t.todoList = :todoList')
            ->setParameter('todoList', $todoList)
            ->getQuery()
            ->execute();
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?TodoListTask
    {
        return $this->createQueryBuilder('t')
            ->join('t.todoList', 'tl')
            ->join('tl.project', 'p')
            ->where('t.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByTodoListAndStatusPaginated(TodoList $todoList, TodoListStatus $status, int $page, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.todoList = :todoList')
            ->andWhere('t.status = :status')
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
