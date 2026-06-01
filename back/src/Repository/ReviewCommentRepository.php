<?php

namespace App\Repository;

use App\Entity\Enum\ReviewCommentStatus;
use App\Entity\Review;
use App\Entity\ReviewComment;
use App\Entity\ReviewVersion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ReviewComment>
 */
class ReviewCommentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ReviewComment::class);
    }

    public function save(ReviewComment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ReviewComment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuid(string $uuid): ?ReviewComment
    {
        return $this->createQueryBuilder('c')
            ->where('c.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function countOpenTopLevelForVersion(ReviewVersion $reviewVersion): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.reviewVersion = :reviewVersion')
            ->andWhere('c.parentComment IS NULL')
            ->andWhere('c.status = :status')
            ->setParameter('reviewVersion', $reviewVersion)
            ->setParameter('status', ReviewCommentStatus::Open)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Returns a map keyed by Review.id with the open top-level comment count
     * on each review's latest ReviewVersion. Reviews with no version (or no
     * matching comments) are absent from the map — callers should treat
     * missing keys as zero.
     *
     * @param Review[] $reviews
     * @return array<int, int>
     */
    public function getOpenTopLevelCountsForLatestVersions(array $reviews): array
    {
        if ($reviews === []) {
            return [];
        }

        $reviewIds = array_values(array_filter(array_map(
            static fn(Review $review) => $review->getId(),
            $reviews,
        )));

        if ($reviewIds === []) {
            return [];
        }

        $rows = $this->createQueryBuilder('c')
            ->select('IDENTITY(rv.review) AS reviewId', 'COUNT(c.id) AS unresolvedCount')
            ->innerJoin('c.reviewVersion', 'rv')
            ->where('rv.review IN (:reviewIds)')
            ->andWhere('c.parentComment IS NULL')
            ->andWhere('c.status = :status')
            ->andWhere('NOT EXISTS (
                SELECT 1 FROM ' . ReviewVersion::class . ' rvLater
                WHERE rvLater.review = rv.review AND rvLater.createdAt > rv.createdAt
            )')
            ->setParameter('reviewIds', $reviewIds)
            ->setParameter('status', ReviewCommentStatus::Open)
            ->groupBy('rv.review')
            ->getQuery()
            ->getArrayResult();

        $counts = [];
        foreach ($rows as $row) {
            $counts[(int) $row['reviewId']] = (int) $row['unresolvedCount'];
        }

        return $counts;
    }

    /**
     * Returns a map keyed by Review.id with the open top-level comments on each
     * review's latest ReviewVersion. Reviews with no version (or no matching
     * comments) are absent from the map — callers should treat missing keys as
     * an empty array.
     *
     * Comments are ordered oldest-first within each review so the most
     * long-standing feedback surfaces first.
     *
     * @param Review[] $reviews
     * @return array<int, ReviewComment[]>
     */
    public function getOpenTopLevelForLatestVersionByReviews(array $reviews): array
    {
        if ($reviews === []) {
            return [];
        }

        $reviewIds = array_values(array_filter(array_map(
            static fn(Review $review) => $review->getId(),
            $reviews,
        )));

        if ($reviewIds === []) {
            return [];
        }

        /** @var ReviewComment[] $comments */
        $comments = $this->createQueryBuilder('c')
            ->innerJoin('c.reviewVersion', 'rv')
            ->where('rv.review IN (:reviewIds)')
            ->andWhere('c.parentComment IS NULL')
            ->andWhere('c.status = :status')
            ->andWhere('NOT EXISTS (
                SELECT 1 FROM ' . ReviewVersion::class . ' rvLater
                WHERE rvLater.review = rv.review AND rvLater.createdAt > rv.createdAt
            )')
            ->setParameter('reviewIds', $reviewIds)
            ->setParameter('status', ReviewCommentStatus::Open)
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();

        $grouped = [];
        foreach ($comments as $comment) {
            $reviewId = $comment->getReviewVersion()?->getReview()?->getId();
            if ($reviewId === null) {
                continue;
            }

            $grouped[$reviewId][] = $comment;
        }

        return $grouped;
    }

    /**
     * @return ReviewComment[]
     */
    public function getByReviewVersionPaginated(ReviewVersion $reviewVersion, int $page, int $limit): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.reviewVersion = :reviewVersion')
            ->andWhere('c.parentComment IS NULL')
            ->setParameter('reviewVersion', $reviewVersion)
            ->orderBy('c.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
