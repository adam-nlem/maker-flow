<?php

namespace App\Repository;

use App\Entity\Enum\ReviewCommentStatus;
use App\Entity\Enum\ReviewStatus;
use App\Entity\Project;
use App\Entity\Review;
use App\Entity\ReviewComment;
use App\Entity\ReviewVersion;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Review>
 */
class ReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Review::class);
    }

    public function save(Review $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Review $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuid(string $uuid): ?Review
    {
        return $this->createQueryBuilder('r')
            ->where('r.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndProject(string $uuid, Project $project): ?Review
    {
        return $this->createQueryBuilder('r')
            ->where('r.uuid = :uuid')
            ->andWhere('r.project = :project')
            ->setParameter('uuid', $uuid)
            ->setParameter('project', $project)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Review[]
     */
    public function getByProjectPaginated(
        Project $project,
        int $page,
        int $limit,
        ?ReviewStatus $status = null,
        ?string $searchTerm = null,
    ): array {
        $qb = $this->createQueryBuilder('r')
            ->where('r.project = :project')
            ->setParameter('project', $project)
            ->orderBy('r.updatedAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($status !== null) {
            $qb->innerJoin('r.versions', 'rv')
                ->andWhere('rv.status = :status')
                ->andWhere('NOT EXISTS (
                    SELECT 1 FROM ' . ReviewVersion::class . ' rvLater
                    WHERE rvLater.review = r AND rvLater.createdAt > rv.createdAt
                )')
                ->setParameter('status', $status);
        }

        if ($searchTerm !== null) {
            $qb->andWhere('LOWER(r.title) LIKE LOWER(:searchTerm)')
                ->setParameter('searchTerm', '%' . $searchTerm . '%');
        }

        return $qb
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns reviews in the project whose latest version is `Pending` and on
     * which the given user has not yet posted any comment. Powers the Client
     * home "awaiting your review" panel.
     *
     * @return Review[]
     */
    public function getByProjectAwaitingUserActionPaginated(
        Project $project,
        User $user,
        int $page,
        int $limit,
    ): array {
        return $this->createQueryBuilder('r')
            ->innerJoin('r.versions', 'rv')
            ->where('r.project = :project')
            ->andWhere('rv.status = :status')
            ->andWhere('NOT EXISTS (
                SELECT 1 FROM ' . ReviewVersion::class . ' rvLater
                WHERE rvLater.review = r AND rvLater.createdAt > rv.createdAt
            )')
            ->andWhere('NOT EXISTS (
                SELECT 1 FROM ' . ReviewComment::class . ' cByUser
                WHERE cByUser.reviewVersion = rv AND cByUser.author = :user
            )')
            ->setParameter('project', $project)
            ->setParameter('status', ReviewStatus::Pending)
            ->setParameter('user', $user)
            ->orderBy('r.updatedAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Returns reviews in the project whose latest version has at least one open
     * top-level comment, ordered by most recently updated review first.
     *
     * @return Review[]
     */
    public function getByProjectWithPendingCommentsPaginated(Project $project, int $page, int $limit): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.project = :project')
            ->andWhere('EXISTS (
                SELECT 1 FROM ' . ReviewComment::class . ' c
                INNER JOIN ' . ReviewVersion::class . ' rv WITH c.reviewVersion = rv
                WHERE rv.review = r
                  AND c.parentComment IS NULL
                  AND c.status = :status
                  AND NOT EXISTS (
                      SELECT 1 FROM ' . ReviewVersion::class . ' rvLater
                      WHERE rvLater.review = r AND rvLater.createdAt > rv.createdAt
                  )
            )')
            ->setParameter('project', $project)
            ->setParameter('status', ReviewCommentStatus::Open)
            ->orderBy('r.updatedAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countByProject(Project $project): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.project = :project')
            ->setParameter('project', $project)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
