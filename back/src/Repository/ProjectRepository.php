<?php

namespace App\Repository;

use App\Entity\Agency;
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

    public function getByUuidAndAgency(string $uuid, Agency $agency): ?Project
    {
        return $this->createQueryBuilder('p')
            ->where('p.uuid = :uuid')
            ->andWhere('p.agency = :agency')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $agency)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?Project
    {
        return $this->createQueryBuilder('p')
            ->where('p.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByNameAndAgency(string $name, Agency $agency): ?Project
    {
        return $this->createQueryBuilder('p')
            ->where('p.name = :name')
            ->andWhere('p.agency = :agency')
            ->setParameter('name', $name)
            ->setParameter('agency', $agency)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function countByAgency(Agency $agency): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.agency = :agency')
            ->setParameter('agency', $agency)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByAgencyPaginated(Agency $agency, int $page, int $limit): array
    {
        $query = $this->createQueryBuilder('p')
            ->where('p.agency = :agency')
            ->setParameter('agency', $agency)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery();
        $query->setHint(Query::HINT_INCLUDE_META_COLUMNS, true);
        return $query->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
