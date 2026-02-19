<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsightBreakdown;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<SocialAnalyticsPostInsightBreakdown>
 */
class SocialAnalyticsPostInsightBreakdownRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsPostInsightBreakdown::class);
    }

    public function save(SocialAnalyticsPostInsightBreakdown $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsPostInsightBreakdown $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @param SocialAnalyticsPostInsightBreakdown[] $entities
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
