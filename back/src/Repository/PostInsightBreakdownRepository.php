<?php

namespace App\Repository;

use App\Entity\PostInsightBreakdown;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PostInsightBreakdown>
 */
class PostInsightBreakdownRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostInsightBreakdown::class);
    }

    public function save(PostInsightBreakdown $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostInsightBreakdown $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @param PostInsightBreakdown[] $entities
     */
    public function bulkSave(array $entities, bool $flush = false): void
    {
        $em = $this->getEntityManager();

        foreach ($entities as $entity) {
            $em->persist($entity);
        }

        if ($flush) {
            $em->flush();
        }
    }
}
