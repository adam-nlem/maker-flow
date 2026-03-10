<?php

namespace App\Repository;

use App\Entity\Enum\ScriptStatus;
use App\Entity\Project;
use App\Entity\Script;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Script::class);
    }

    public function save(Script $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Script $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?Script
    {
        return $this->createQueryBuilder('s')
            ->where('s.uuid = :uuid')
            ->andWhere('s.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Script[]
     */
    public function getByProjectAndUser(Project $project, User $user): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Script[]
     */
    public function getByProjectAndUserPaginated(Project $project, User $user, int $page, int $limit, ?ScriptStatus $status = null): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->orderBy('s.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($status !== null) {
            $qb->andWhere('s.status = :status')
                ->setParameter('status', $status);
        }

        return $qb
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Script[]
     */
    public function countByProjectAndUser(Project $project, User $user): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByProjectAndUserAndMonth(Project $project, User $user, int $year, int $month): array
    {
        $startOfMonth = new \DateTimeImmutable("$year-$month-01");
        $startOfNextMonth = $startOfMonth->modify('first day of next month');

        return $this->createQueryBuilder('s')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->andWhere('s.publishedAt >= :startOfMonth')
            ->andWhere('s.publishedAt < :startOfNextMonth')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->setParameter('startOfMonth', $startOfMonth)
            ->setParameter('startOfNextMonth', $startOfNextMonth)
            ->orderBy('s.publishedAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

}
