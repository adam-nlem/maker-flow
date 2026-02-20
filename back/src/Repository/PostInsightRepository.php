<?php

namespace App\Repository;

use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostInsight;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
}
