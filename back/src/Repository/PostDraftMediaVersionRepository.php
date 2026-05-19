<?php

namespace App\Repository;

use App\Entity\PostDraftMediaVersion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PostDraftMediaVersion>
 */
class PostDraftMediaVersionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostDraftMediaVersion::class);
    }

    public function save(PostDraftMediaVersion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostDraftMediaVersion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getById(int $id): ?PostDraftMediaVersion
    {
        return $this->createQueryBuilder('mv')
            ->where('mv.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuid(string $uuid): ?PostDraftMediaVersion
    {
        return $this->createQueryBuilder('mv')
            ->where('mv.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
