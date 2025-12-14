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
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }



    //    /**
    //     * @return TodoListTask[] Returns an array of TodoListTask objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('t.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?TodoListTask
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
