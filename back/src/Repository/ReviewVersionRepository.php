<?php

namespace App\Repository;

use App\Entity\Agency;
use App\Entity\ReviewVersion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ReviewVersion>
 */
class ReviewVersionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ReviewVersion::class);
    }

    public function save(ReviewVersion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ReviewVersion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getById(int $id): ?ReviewVersion
    {
        return $this->createQueryBuilder('rv')
            ->where('rv.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuid(string $uuid): ?ReviewVersion
    {
        return $this->createQueryBuilder('rv')
            ->where('rv.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function sumVideoSecondsByAgency(Agency $agency): int
    {
        return (int) $this->createQueryBuilder('rv')
            ->select('COALESCE(SUM(rv.durationSeconds), 0)')
            ->join('rv.review', 'r')
            ->join('r.project', 'p')
            ->where('p.agency = :agency')
            ->setParameter('agency', $agency)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function sumStorageBytesByAgency(Agency $agency): int
    {
        return (int) $this->createQueryBuilder('rv')
            ->select('COALESCE(SUM(rv.fileSizeBytes), 0)')
            ->join('rv.review', 'r')
            ->join('r.project', 'p')
            ->where('p.agency = :agency')
            ->setParameter('agency', $agency)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
