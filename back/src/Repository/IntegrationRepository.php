<?php

namespace App\Repository;

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

    public function getByUuidAndUser(string $uuid, User $user): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.uuid = :uuid')
            ->andWhere('i.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserPaginated(User $user, int $page, int $limit): array
    {
        $query = $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->setParameter('user', $user)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery();
        $query->setHint(Query::HINT_INCLUDE_META_COLUMNS, true);
        return $query->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserAndPlatformAndAccountId(User $user, Platform $platform, string $accountId): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.platform = :platform')
            ->andWhere('i.accountId = :accountId')
            ->setParameter('user', $user)
            ->setParameter('platform', $platform)
            ->setParameter('accountId', $accountId)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByProjectAndUser(Project $project, User $user): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.project = :project')
            ->andWhere('i.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
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
    public function getByPlatformsNotSyncedSinceAndStatus(array $platforms, \DateTimeImmutable $since, IntegrationStatus $status): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.platform IN (:platforms)')
            ->andWhere('i.lastSyncedAt < :since')
            ->andWhere('i.status = :status')
            ->setParameter('platforms', $platforms)
            ->setParameter('since', $since)
            ->setParameter('status', $status)
            ->orderBy('i.lastSyncedAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
