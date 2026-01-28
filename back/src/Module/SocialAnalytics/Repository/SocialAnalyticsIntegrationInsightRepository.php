<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Entity\Integration;
use App\Entity\User;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<SocialAnalyticsIntegrationInsight>
 */
class SocialAnalyticsIntegrationInsightRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsIntegrationInsight::class);
    }

    public function save(SocialAnalyticsIntegrationInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsIntegrationInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLatestByUserAndByIntegration(
        User $user,
        Integration $integration,
    ): array {

        $subQuery = $this->createQueryBuilder('si')
            ->select('MAX(si.createdAt)')
            ->where('si.user = :user')
            ->andWhere('si.integration = :integration')
            ->andWhere('si.type = i.type')
            ->getDQL();

        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.integration = :integration')
            ->andWhere("i.createdAt = ($subQuery)")
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getLatestByIntegrationAndByTypeAndByValue(
        Integration $integration,
        SocialAnalyticsIntegrationInsightType $type,
        int $value,
    ): ?SocialAnalyticsIntegrationInsight {
        return $this->createQueryBuilder('ii')
            ->where('ii.integration = :integration')
            ->andWhere('ii.type = :type')
            ->andWhere('ii.value = :value')
            ->setParameter('integration', $integration)
            ->setParameter('type', $type)
            ->setParameter('value', $value)
            ->orderBy('ii.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getLatestByUserAndByIntegrationAndByType(
        User $user,
        Integration $integration,
        SocialAnalyticsIntegrationInsightType $type,
    ): ?SocialAnalyticsIntegrationInsight {
        return $this->createQueryBuilder('ii')
            ->where('ii.user = :user')
            ->andWhere('ii.integration = :integration')
            ->andWhere('ii.type = :type')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('type', $type)
            ->orderBy('ii.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserAndIntegrationAndTimePeriod(
        User $user,
        Integration $integration,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $subQuery = $this->createQueryBuilder('si')
            ->select('MAX(si.createdAt)')
            ->where('si.user = :user')
            ->andWhere('si.integration = :integration')
            ->andWhere('si.createdAt >= :startDate')
            ->andWhere('si.createdAt <= :endDate')
            ->andWhere('si.type = i.type')
            ->getDQL();

        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.integration = :integration')
            ->andWhere('i.createdAt >= :startDate')
            ->andWhere('i.createdAt <= :endDate')
            ->andWhere("i.createdAt = ($subQuery)")
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param SocialAnalyticsIntegrationInsightType[] $types
     * @return SocialAnalyticsIntegrationInsight[]
     */
    public function getDailyByUserAndIntegrationAndTypes(
        User $user,
        Integration $integration,
        array $types,
        \DateTimeImmutable $startDate,
    ): array {
        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.integration = :integration')
            ->andWhere('i.type IN (:types)')
            ->andWhere('i.createdAt >= :startDate')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('types', $types)
            ->setParameter('startDate', $startDate)
            ->orderBy('i.createdAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
