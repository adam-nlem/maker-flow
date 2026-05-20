<?php

namespace App\Repository;

use App\Entity\PostDraftMediaVersionComment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PostDraftMediaVersionComment>
 */
class PostDraftMediaVersionCommentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostDraftMediaVersionComment::class);
    }

    public function save(PostDraftMediaVersionComment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostDraftMediaVersionComment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuid(string $uuid): ?PostDraftMediaVersionComment
    {
        return $this->createQueryBuilder('c')
            ->where('c.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
