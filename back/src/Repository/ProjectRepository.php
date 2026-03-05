<?php

namespace App\Repository;

use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<Project>
 */
class ProjectRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Project::class);
    }

    public function save(Project $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Project $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?Project
    {
        return $this->createQueryBuilder('p')
            ->where('p.uuid = :uuid')
            ->andWhere('p.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByNameAndUser(string $name, User $user): ?Project
    {
        return $this->createQueryBuilder('p')
            ->where('p.name = :name')
            ->andWhere('p.user = :user')
            ->setParameter('name', $name)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function countByUser(User $user): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByUserPaginated(User $user, int $page, int $limit): array
    {
        $query = $this->createQueryBuilder('p')
            ->where('p.user = :user')
            ->setParameter('user', $user)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery();
        $query->setHint(Query::HINT_INCLUDE_META_COLUMNS, true);
        return $query->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
