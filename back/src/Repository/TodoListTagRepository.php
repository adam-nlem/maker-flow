<?php

namespace App\Repository;

use App\Entity\TodoList;
use App\Entity\TodoListTag;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<TodoListTag>
 */
class TodoListTagRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TodoListTag::class);
    }

    public function save(TodoListTag $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TodoListTag $entity, bool $flush = false): void
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

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?TodoListTag
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

    public function getByTodoListAndWithUuidIn(TodoList $todoList, array $uuids): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.todoList = :todoList')
            ->andWhere('t.uuid IN (:uuids)')
            ->setParameter('todoList', $todoList)
            ->setParameter('uuids', $uuids)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByTodoListLimited(TodoList $todoList, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.todoList = :todoList')
            ->setParameter('todoList', $todoList)
            ->setMaxResults($limit)
            ->addOrderBy(
                'CASE WHEN t.updatedAt IS NOT NULL THEN t.updatedAt ELSE t.createdAt END',
                'DESC'
            )
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getBySearchTermAndTodoListLimited(string $searchTerm, TodoList $todoList, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.todoList = :todoList')
            ->andWhere('LOWER(t.title) LIKE LOWER(:searchTerm)')
            ->setParameter('todoList', $todoList)
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->setMaxResults($limit)
            ->addOrderBy(
                'CASE WHEN t.updatedAt IS NOT NULL THEN t.updatedAt ELSE t.createdAt END',
                'DESC'
            )
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByTitleAndTodoList(string $title, TodoList $todoList): ?TodoListTag
    {
        return $this->createQueryBuilder('t')
            ->where('t.title = :title')
            ->andWhere('t.todoList = :todoList')
            ->setParameter('title', $title)
            ->setParameter('todoList', $todoList)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
