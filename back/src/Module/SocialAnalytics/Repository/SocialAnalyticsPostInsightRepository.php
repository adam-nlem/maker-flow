<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<SocialAnalyticsPostInsight>
 */
class SocialAnalyticsPostInsightRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsPostInsight::class);
    }

    public function save(SocialAnalyticsPostInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsPostInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLatestByPostAndByTypeAndByValue(
        SocialAnalyticsPost $post,
        SocialAnalyticsPostInsightType $type,
        int $value,
    ): ?SocialAnalyticsPostInsight {
        return $this->createQueryBuilder('pi')
            ->where('pi.socialAnalyticsPost = :post')
            ->andWhere('pi.type = :type')
            ->andWhere('pi.value = :value')
            ->setParameter('post', $post)
            ->setParameter('type', $type)
            ->setParameter('value', $value)
            ->orderBy('pi.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    
    /**
     * @param array $postIds
     * @param \DateTimeImmutable $periodStart
     * @param \DateTimeImmutable $periodEnd
     * @param SocialAnalyticsPostInsightType[] $excludedTypes
     */
    public function getLatestByPostIdsAndTimePeriod(
        array $postIds,
        \DateTimeImmutable $periodStart,
        \DateTimeImmutable $periodEnd,
        array $excludedTypes = [],
    ): array {
        $qb = $this->createQueryBuilder('pi')
            ->where('pi.socialAnalyticsPost IN (:postIds)')
            ->andWhere('pi.createdAt >= :periodStart')
            ->andWhere('pi.createdAt <= :periodEnd')
            ->setParameter('postIds', $postIds)
            ->setParameter('periodStart', $periodStart)
            ->setParameter('periodEnd', $periodEnd)
            ->orderBy('pi.createdAt', 'DESC');

        if (!empty($excludedTypes)) {
            $qb->andWhere('pi.type NOT IN (:excludedTypes)')
                ->setParameter('excludedTypes', $excludedTypes);
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param SocialAnalyticsPostInsightType[] $excludedTypes
     * @return SocialAnalyticsPostInsight[]
     */
    public function getByPostAndCreatedBeforeDate(
        SocialAnalyticsPost $post,
        \DateTimeImmutable $createdBefore,
        array $excludedTypes = [],
    ): array {
        $qb = $this->createQueryBuilder('pi')
            ->where('pi.socialAnalyticsPost = :post')
            ->andWhere('pi.createdAt <= :createdBefore')
            ->setParameter('post', $post)
            ->setParameter('createdBefore', $createdBefore)
            ->orderBy('pi.createdAt', 'DESC');

        if (!empty($excludedTypes)) {
            $qb->andWhere('pi.type NOT IN (:excludedTypes)')
                ->setParameter('excludedTypes', $excludedTypes);
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
