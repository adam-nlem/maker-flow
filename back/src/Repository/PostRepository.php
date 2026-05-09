<?php

namespace App\Repository;

use App\Entity\Enum\Platform;
use App\Entity\Enum\PostInsightType;
use App\Entity\Integration;
use App\Entity\Post;
use App\Entity\PostGroup;
use App\Entity\PostInsight;
use App\Entity\Project;
use App\Entity\User;
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
                FROM post
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

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?Post
    {
        return $this->createQueryBuilder('p')
            ->join('p.integration', 'i')
            ->join('i.project', 'pr')
            ->where('p.uuid = :uuid')
            ->andWhere('(pr.agency = :agency OR pr = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Post[]
     */
    public function getByIntegrationAndPublishedBeforeLimited(
        Integration $integration,
        \DateTimeImmutable $publishedBefore,
        int $limit,
    ): array {
        return $this->createQueryBuilder('p')
            ->where('p.integration = :integration')
            ->andWhere('p.publishedAt < :publishedBefore')
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

    /**
     * @return Post[]
     */
    public function getByProjectAndPublishedAtWindow(
        Project $project,
        \DateTimeImmutable $publishedAt,
        int $hoursWindow,
        Integration $excludeIntegration,
    ): array {
        $from = $publishedAt->modify("-{$hoursWindow} hours");
        $to = $publishedAt->modify("+{$hoursWindow} hours");

        return $this->createQueryBuilder('p')
            ->join('p.integration', 'i')
            ->where('i.project = :project')
            ->andWhere('p.integration != :excludeIntegration')
            ->andWhere('p.publishedAt BETWEEN :from AND :to')
            ->setParameter('project', $project)
            ->setParameter('excludeIntegration', $excludeIntegration)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('p.publishedAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function unlinkPostsByPostGroup(PostGroup $postGroup): void
    {
        $this->createQueryBuilder('p')
            ->update()
            ->set('p.postGroup', ':null')
            ->where('p.postGroup = :postGroup')
            ->setParameter('null', null)
            ->setParameter('postGroup', $postGroup)
            ->getQuery()
            ->execute();
    }

    /**
     * @param string[] $uuids
     * @return Post[]
     */
    public function getAccessibleByUuidsForUser(array $uuids, User $user): array
    {
        return $this->createQueryBuilder('p')
            ->join('p.integration', 'i')
            ->join('i.project', 'pr')
            ->where('p.uuid IN (:uuids)')
            ->andWhere('(pr.agency = :agency OR pr = :clientProject)')
            ->setParameter('uuids', $uuids)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return int[]
     */
    public function getRankedIdsByIntegrationSortedByInsightValue(
        Integration $integration,
        PostInsightType $sortByType,
        int $page,
        int $limit,
    ): array {
        $sub = $this->getEntityManager()->createQueryBuilder()
            ->select('MAX(sub.id)')
            ->from(PostInsight::class, 'sub')
            ->innerJoin('sub.post', 'subPost')
            ->where('subPost.integration = :integration')
            ->andWhere('sub.type = :type')
            ->groupBy('sub.post')
            ->getDQL();

        return $this->createQueryBuilder('p')
            ->select('p.id')
            ->innerJoin('p.postInsights', 'pi')
            ->where('pi.id IN (' . $sub . ')')
            ->andWhere('p.integration = :integration')
            ->setParameter('integration', $integration)
            ->setParameter('type', $sortByType)
            ->orderBy('pi.value', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getSingleColumnResult();
    }

    /**
     * @param int[] $ids
     * @return Post[]
     */
    public function getByIds(array $ids): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.id IN (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Post[]
     */
    public function getByProjectPaginatedAndSearchTerm(
        Project $project,
        ?Platform $platform,
        ?string $searchTerm,
        int $page,
        int $limit,
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->join('p.integration', 'i')
            ->where('i.project = :project')
            ->setParameter('project', $project)
            ->orderBy('p.publishedAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($platform !== null) {
            $qb->andWhere('i.platform = :platform')
                ->setParameter('platform', $platform);
        }

        if ($searchTerm !== null) {
            $qb->andWhere('LOWER(p.caption) LIKE LOWER(:searchTerm)')
                ->setParameter('searchTerm', '%' . $searchTerm . '%');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Post[]
     */
    public function searchByProjectAndCaption(
        Project $project,
        ?Platform $platform,
        string $search,
        int $limit = 20,
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->join('p.integration', 'i')
            ->where('i.project = :project')
            ->andWhere('p.caption LIKE :search')
            ->setParameter('project', $project)
            ->setParameter('search', '%' . $search . '%')
            ->orderBy('p.publishedAt', 'DESC')
            ->setMaxResults($limit);

        if ($platform !== null) {
            $qb->andWhere('i.platform = :platform')
                ->setParameter('platform', $platform);
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Post[]
     */
    public function getUngroupedPosts(): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.postGroup IS NULL')
            ->orderBy('p.publishedAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
