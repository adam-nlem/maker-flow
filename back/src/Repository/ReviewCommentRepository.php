<?php

namespace App\Repository;

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
