<?php

namespace App\Repository;

use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostInsight;
use App\Entity\Project;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<PostInsight>
 */
class PostInsightRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostInsight::class);
    }

    public function save(PostInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLatestByPostAndByTypeAndByValue(
        Post $post,
        PostInsightType $type,
        float $value,
    ): ?PostInsight {
        return $this->createQueryBuilder('pi')
            ->where('pi.post = :post')
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
     * @param PostInsightType[] $excludedTypes
     */
    public function getLatestByPostIdsAndTimePeriod(
        array $postIds,
        \DateTimeImmutable $periodStart,
        \DateTimeImmutable $periodEnd,
        array $excludedTypes = [],
    ): array {
        $qb = $this->createQueryBuilder('pi')
            ->where('pi.post IN (:postIds)')
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
     * Returns one insight per type (the most recent) for a given post.
     *
     * @return PostInsight[]
     */
    public function getLatestByPostGroupedByType(Post $post): array
    {
        $sub = $this->createQueryBuilder('sub')
            ->select('MAX(sub.id)')
            ->where('sub.post = :post')
            ->groupBy('sub.type')
            ->getDQL();

        return $this->createQueryBuilder('pi')
            ->where('pi.id IN (' . $sub . ')')
            ->setParameter('post', $post)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns all insights for a single post filtered to specific types, ordered by createdAt ASC.
     *
     * @param PostInsightType[] $types
     * @return PostInsight[]
     */
    public function getByPostAndTypes(Post $post, array $types): array
    {
        return $this->createQueryBuilder('pi')
            ->where('pi.post = :post')
            ->andWhere('pi.type IN (:types)')
            ->setParameter('post', $post)
            ->setParameter('types', $types)
            ->orderBy('pi.createdAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns all insights for multiple posts filtered to specific types, ordered by createdAt ASC.
     *
     * @param int[] $postIds
     * @param PostInsightType[] $types
     * @return PostInsight[]
     */
    public function getByPostIdsAndTypes(array $postIds, array $types): array
    {
        return $this->createQueryBuilder('pi')
            ->where('pi.post IN (:postIds)')
            ->andWhere('pi.type IN (:types)')
            ->setParameter('postIds', $postIds)
            ->setParameter('types', $types)
            ->orderBy('pi.createdAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns one insight per type per post (the most recent) for multiple posts.
     *
     * @param int[] $postIds
     * @return PostInsight[]
     */
    public function getLatestByPostIdsGroupedByPostAndType(array $postIds): array
    {
        if (empty($postIds)) {
            return [];
        }

        $sub = $this->createQueryBuilder('sub')
            ->select('MAX(sub.id)')
            ->where('sub.post IN (:postIds)')
            ->groupBy('sub.post, sub.type')
            ->getDQL();

        return $this->createQueryBuilder('pi')
            ->where('pi.id IN (' . $sub . ')')
            ->setParameter('postIds', $postIds)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns one insight per type (the most recent before the given date) for a given post.
     *
     * @param PostInsightType[] $excludedTypes
     * @return PostInsight[]
     */
    public function getLatestByPostGroupedByTypeBeforeDate(
        Post $post,
        \DateTimeImmutable $createdBefore,
        array $excludedTypes = [],
    ): array {
        $subQb = $this->createQueryBuilder('sub')
            ->select('MAX(sub.id)')
            ->where('sub.post = :post')
            ->andWhere('sub.createdAt <= :createdBefore')
            ->groupBy('sub.type');

        if (!empty($excludedTypes)) {
            $subQb->andWhere('sub.type NOT IN (:excludedTypes)');
        }

        $qb = $this->createQueryBuilder('pi')
            ->where('pi.id IN (' . $subQb->getDQL() . ')')
            ->setParameter('post', $post)
            ->setParameter('createdBefore', $createdBefore);

        if (!empty($excludedTypes)) {
            $qb->setParameter('excludedTypes', $excludedTypes);
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns the latest insight value per post per type.
     *
     * @param int[] $postIds
     * @return array<array{postId: int, type: PostInsightType|string, value: string}>
     */
    public function getAggregatedLatestByPostIds(array $postIds): array
    {
        if (empty($postIds)) {
            return [];
        }

        $sub = $this->createQueryBuilder('sub')
            ->select('MAX(sub.id)')
            ->where('sub.post IN (:postIds)')
            ->groupBy('sub.post, sub.type')
            ->getDQL();

        return $this->createQueryBuilder('pi')
            ->select('IDENTITY(pi.post) as postId, pi.type as type, pi.value as value')
            ->where('pi.id IN (' . $sub . ')')
            ->setParameter('postIds', $postIds)
            ->getQuery()
            ->getResult();
    }

    /**
     * Returns aggregated insight values per post group and per type,
     * using the latest insight per post per type.
     * Cumulative metrics (views, likes, etc.) are summed.
     * Rate/average metrics (average watch time, click rate, etc.) are averaged.
     *
     * @param int[] $postGroupIds
     * @return array<array{postGroupId: int, type: PostInsightType|string, totalValue: string|float}>
     */
    public function getAggregatedLatestByPostGroupIds(array $postGroupIds): array
    {
        if (empty($postGroupIds)) {
            return [];
        }

        $sub = $this->createQueryBuilder('sub')
            ->select('MAX(sub.id)')
            ->innerJoin('sub.post', 'subPost')
            ->where('subPost.postGroup IN (:postGroupIds)')
            ->groupBy('sub.post, sub.type')
            ->getDQL();

        $rows = $this->createQueryBuilder('pi')
            ->select('IDENTITY(p.postGroup) as postGroupId, pi.type as type, SUM(pi.value) as sumValue, COUNT(pi.value) as postCount')
            ->innerJoin('pi.post', 'p')
            ->where('pi.id IN (' . $sub . ')')
            ->setParameter('postGroupIds', $postGroupIds)
            ->groupBy('p.postGroup, pi.type')
            ->getQuery()
            ->getResult();

        return array_map(function (array $row): array {
            $type = $row['type'] instanceof PostInsightType
                ? $row['type']
                : PostInsightType::from($row['type']);

            return [
                'postGroupId' => $row['postGroupId'],
                'type' => $row['type'],
                'totalValue' => $type->shouldAverage()
                    ? (float) $row['sumValue'] / max((int) $row['postCount'], 1)
                    : $row['sumValue'],
            ];
        }, $rows);
    }

    /**
     * Computes total growth per PostInsightType across all posts in a project for a date range.
     * Growth per post+type = latest snapshot in [startDate, endDate] - latest snapshot before startDate.
     * If no baseline exists (new post), uses the full latest value.
     *
     * @param PostInsightType[] $types
     * @return array<array{type: string, totalGrowth: float}>
     */
    public function getGrowthByProjectAndTypesInPeriod(
        Project $project,
        array $types,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "
            SELECT
                latest.type,
                SUM(CASE
                    WHEN baseline.value IS NOT NULL THEN latest.value - baseline.value
                    WHEN p.published_at >= :startDate THEN latest.value
                    ELSE 0
                END) AS totalGrowth
            FROM (
                SELECT pi.post_id, pi.type, pi.value
                FROM post_insight pi
                WHERE pi.id IN (
                    SELECT MAX(pi2.id)
                    FROM post_insight pi2
                    INNER JOIN post p2 ON pi2.post_id = p2.id
                    INNER JOIN integration i2 ON p2.integration_id = i2.id
                    WHERE i2.project_id = :projectId
                      AND pi2.type IN (:types)
                      AND pi2.created_at >= :startDate
                      AND pi2.created_at <= :endDate
                    GROUP BY pi2.post_id, pi2.type
                )
            ) latest
            INNER JOIN post p ON latest.post_id = p.id
            LEFT JOIN (
                SELECT pi.post_id, pi.type, pi.value
                FROM post_insight pi
                WHERE pi.id IN (
                    SELECT MAX(pi3.id)
                    FROM post_insight pi3
                    INNER JOIN post p3 ON pi3.post_id = p3.id
                    INNER JOIN integration i3 ON p3.integration_id = i3.id
                    WHERE i3.project_id = :projectId
                      AND pi3.type IN (:types)
                      AND pi3.created_at < :startDate
                    GROUP BY pi3.post_id, pi3.type
                )
            ) baseline ON latest.post_id = baseline.post_id AND latest.type = baseline.type
            GROUP BY latest.type
        ";

        $typeValues = array_map(fn(PostInsightType $t) => $t->value, $types);

        return $conn->executeQuery($sql, [
            'projectId' => $project->getId(),
            'types' => $typeValues,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
        ], [
            'types' => ArrayParameterType::STRING,
        ])->fetchAllAssociative();
    }

    /**
     * Same as getGrowthByProjectAndTypesInPeriod but grouped by integration.
     *
     * @param PostInsightType[] $types
     * @return array<array{integrationId: int, type: string, totalGrowth: float}>
     */
    public function getGrowthByProjectAndTypesInPeriodGroupedByIntegration(
        Project $project,
        array $types,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "
            SELECT
                p.integration_id AS integrationId,
                latest.type,
                SUM(CASE
                    WHEN baseline.value IS NOT NULL THEN latest.value - baseline.value
                    WHEN p.published_at >= :startDate THEN latest.value
                    ELSE 0
                END) AS totalGrowth
            FROM (
                SELECT pi.post_id, pi.type, pi.value
                FROM post_insight pi
                WHERE pi.id IN (
                    SELECT MAX(pi2.id)
                    FROM post_insight pi2
                    INNER JOIN post p2 ON pi2.post_id = p2.id
                    INNER JOIN integration i2 ON p2.integration_id = i2.id
                    WHERE i2.project_id = :projectId
                      AND pi2.type IN (:types)
                      AND pi2.created_at >= :startDate
                      AND pi2.created_at <= :endDate
                    GROUP BY pi2.post_id, pi2.type
                )
            ) latest
            INNER JOIN post p ON latest.post_id = p.id
            LEFT JOIN (
                SELECT pi.post_id, pi.type, pi.value
                FROM post_insight pi
                WHERE pi.id IN (
                    SELECT MAX(pi3.id)
                    FROM post_insight pi3
                    INNER JOIN post p3 ON pi3.post_id = p3.id
                    INNER JOIN integration i3 ON p3.integration_id = i3.id
                    WHERE i3.project_id = :projectId
                      AND pi3.type IN (:types)
                      AND pi3.created_at < :startDate
                    GROUP BY pi3.post_id, pi3.type
                )
            ) baseline ON latest.post_id = baseline.post_id AND latest.type = baseline.type
            GROUP BY p.integration_id, latest.type
        ";

        $typeValues = array_map(fn(PostInsightType $t) => $t->value, $types);

        return $conn->executeQuery($sql, [
            'projectId' => $project->getId(),
            'types' => $typeValues,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
        ], [
            'types' => ArrayParameterType::STRING,
        ])->fetchAllAssociative();
    }

    /**
     * Returns daily growth for a given insight type grouped by platform across all posts in a project.
     * Uses LAG window function to compute per-snapshot diffs, then aggregates by platform and date.
     *
     * @return array<array{platform: string, date: string, value: float}>
     */
    public function getDailyGrowthByProjectAndTypeInPeriod(
        Project $project,
        PostInsightType $type,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "
            WITH relevant_snapshots AS (
                SELECT pi.id, pi.post_id, pi.value, pi.created_at, i.platform, p.published_at
                FROM post_insight pi
                INNER JOIN post p ON pi.post_id = p.id
                INNER JOIN integration i ON p.integration_id = i.id
                WHERE i.project_id = :projectId
                  AND pi.type = :type
                  AND pi.created_at >= :startDate
                  AND pi.created_at <= :endDate

                UNION ALL

                SELECT pi.id, pi.post_id, pi.value, pi.created_at, i.platform, p.published_at
                FROM post_insight pi
                INNER JOIN post p ON pi.post_id = p.id
                INNER JOIN integration i ON p.integration_id = i.id
                WHERE pi.id IN (
                    SELECT MAX(pi2.id)
                    FROM post_insight pi2
                    INNER JOIN post p2 ON pi2.post_id = p2.id
                    INNER JOIN integration i2 ON p2.integration_id = i2.id
                    WHERE i2.project_id = :projectId
                      AND pi2.type = :type
                      AND pi2.created_at < :startDate
                    GROUP BY pi2.post_id
                )
            ),
            with_lag AS (
                SELECT
                    rs.post_id,
                    rs.value,
                    rs.created_at,
                    rs.platform,
                    rs.published_at,
                    DATE(rs.created_at) AS snapshot_date,
                    LAG(rs.value) OVER (PARTITION BY rs.post_id ORDER BY rs.created_at, rs.id) AS prev_value
                FROM relevant_snapshots rs
            )
            SELECT
                platform,
                snapshot_date AS date,
                SUM(CASE
                    WHEN prev_value IS NOT NULL THEN value - prev_value
                    WHEN published_at >= :startDate THEN value
                    ELSE 0
                END) AS value
            FROM with_lag
            WHERE snapshot_date >= :startDateOnly
              AND snapshot_date <= :endDateOnly
            GROUP BY platform, snapshot_date
            ORDER BY snapshot_date ASC, platform ASC
        ";

        return $conn->executeQuery($sql, [
            'projectId' => $project->getId(),
            'type' => $type->value,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
            'startDateOnly' => $startDate->format('Y-m-d'),
            'endDateOnly' => $endDate->format('Y-m-d'),
        ])->fetchAllAssociative();
    }
}
