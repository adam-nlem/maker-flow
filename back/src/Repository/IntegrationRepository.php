<?php

namespace App\Repository;

use App\Entity\Agency;
use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Integration;
use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Integration>
 */
class IntegrationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Integration::class);
    }

    public function save(Integration $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Integration $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getById(int $id): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByIdAndStatus(int $id, IntegrationStatus $status): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.id = :id')
            ->andWhere('i.status = :status')
            ->setParameter('id', $id)
            ->setParameter('status', $status)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndAgency(string $uuid, Agency $agency): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->join('i.project', 'p')
            ->where('i.uuid = :uuid')
            ->andWhere('p.agency = :agency')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $agency)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->join('i.project', 'p')
            ->where('i.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Integration[]
     */
    public function getByProject(Project $project): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.project = :project')
            ->setParameter('project', $project)
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByAgencyAndPlatformAndAccountId(Agency $agency, Platform $platform, string $accountId): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->join('i.project', 'p')
            ->where('p.agency = :agency')
            ->andWhere('i.platform = :platform')
            ->andWhere('i.accountId = :accountId')
            ->setParameter('agency', $agency)
            ->setParameter('platform', $platform)
            ->setParameter('accountId', $accountId)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getOneByProjectAndPlatformAndStatus(Project $project, Platform $platform, IntegrationStatus $status): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.project = :project')
            ->andWhere('i.platform = :platform')
            ->andWhere('i.status = :status')
            ->setParameter('project', $project)
            ->setParameter('platform', $platform)
            ->setParameter('status', $status)
            ->orderBy('i.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByPlatform(Platform $platform): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.platform = :platform')
            ->setParameter('platform', $platform)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByPlatformAndStatus(Platform $platform, IntegrationStatus $status): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.platform = :platform')
            ->andWhere('i.status = :status')
            ->setParameter('platform', $platform)
            ->setParameter('status', $status)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param Platform[] $platforms
     * @return Integration[]
     */
    public function getByPlatformsNotSyncedSince(array $platforms, \DateTimeImmutable $since): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.platform IN (:platforms)')
            ->andWhere('i.lastSyncedAt < :since')
            ->setParameter('platforms', $platforms)
            ->setParameter('since', $since)
            ->orderBy('i.lastSyncedAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param Platform[] $platforms
     * @return Integration[]
     */
    public function getByMultiplePlatformsAndStatus(array $platforms, IntegrationStatus $status): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.platform IN (:platforms)')
            ->andWhere('i.status = :status')
            ->setParameter('platforms', $platforms)
            ->setParameter('status', $status)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
