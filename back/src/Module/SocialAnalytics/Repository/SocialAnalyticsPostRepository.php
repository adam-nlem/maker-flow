<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Entity\Integration;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

class SocialAnalyticsPostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsPost::class);
    }

    public function save(SocialAnalyticsPost $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsPost $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByExternalIdAndIntegration(string $externalId, Integration $integration): ?SocialAnalyticsPost
    {
        return $this->createQueryBuilder('p')
            ->where('p.externalId = :externalId')
            ->andWhere('p.integration = :integration')
            ->setParameter('externalId', $externalId)
            ->setParameter('integration', $integration)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function countByIntegration(Integration $integration): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.integration = :integration')
            ->setParameter('integration', $integration)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function calculateStreak(Integration $integration): int
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "
            WITH unique_days AS (
                SELECT DISTINCT DATE(published_at) AS post_date
                FROM social_analytics_post
                WHERE integration_id = :integration_id
            ),
            streak_check AS (
                SELECT 
                    post_date,
                    DATE_SUB(post_date, INTERVAL ROW_NUMBER() OVER (ORDER BY post_date ASC) DAY) AS streak_group
                FROM unique_days
            ),
            most_recent AS (
                SELECT MAX(post_date) AS last_post_date
                FROM unique_days
            )
            SELECT 
                CASE 
                    WHEN (SELECT last_post_date FROM most_recent) IS NULL
                    THEN 0
                    WHEN (SELECT last_post_date FROM most_recent) < DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)
                    THEN 0
                    ELSE (
                        SELECT COUNT(*)
                        FROM streak_check
                        WHERE streak_group = (
                            SELECT streak_group 
                            FROM streak_check 
                            ORDER BY post_date DESC 
                            LIMIT 1
                        )
                    )
                END AS streak
        ";

        $result = $conn->executeQuery($sql, [
            'integration_id' => $integration->getId(),
        ])->fetchOne();

        return (int) ($result ?? 0);
    }
}
