<?php

namespace App\Repository;

use App\Entity\Integration;
use App\Entity\User;
use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    public function save(Post $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Post $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByExternalIdAndIntegration(string $externalId, Integration $integration): ?Post
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
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getSingleScalarResult(Query::HYDRATE_SIMPLEOBJECT);
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

    /**
     * @return Post[]
     */
    public function getByUserAndIntegrationPaginated(
        User $user,
        Integration $integration,
        int $page,
        int $limit,
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.user = :user')
            ->andWhere('p.integration = :integration')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('p.publishedAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Post[]
     */
    public function getByUserAndIntegrationAndPublishedAfterPaginated(
        User $user,
        Integration $integration,
        \DateTimeImmutable $publishedAfter,
        int $page,
        int $limit,
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.user = :user')
            ->andWhere('p.integration = :integration')
            ->andWhere('p.publishedAt >= :publishedAfter')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('publishedAfter', $publishedAfter)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('p.publishedAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndUser(string $uuid, User $user): ?Post
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

    /**
     * @return Post[]
     */
    public function getByUserAndIntegrationAndPublishedBeforeLimited(
        User $user,
        Integration $integration,
        \DateTimeImmutable $publishedBefore,
        int $limit,
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.user = :user')
            ->andWhere('p.integration = :integration')
            ->andWhere('p.publishedAt < :publishedBefore')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('publishedBefore', $publishedBefore)
            ->orderBy('p.publishedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param string[] $externalIds
     * @return array<string, Post> Indexed by externalId
     */
    public function getByExternalIdsAndIntegration(
        array $externalIds,
        Integration $integration
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.externalId IN (:externalIds)')
            ->andWhere('p.integration = :integration')
            ->setParameter('externalIds', $externalIds)
            ->setParameter('integration', $integration)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getSingleByIntegrationAndPublishedBeforeDate(
        Integration $integration,
        \DateTimeImmutable $publishedBefore,
    ): ?Post {
        return $this->createQueryBuilder('p')
            ->where('p.integration = :integration')
            ->andWhere('p.publishedAt < :publishedBefore')
            ->setParameter('integration', $integration)
            ->setParameter('publishedBefore', $publishedBefore)
            ->orderBy('p.publishedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
