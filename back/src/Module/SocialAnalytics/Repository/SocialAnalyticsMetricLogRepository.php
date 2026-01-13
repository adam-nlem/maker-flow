<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Module\SocialAnalytics\Entity\SocialAnalyticsMetricLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SocialAnalyticsMetricLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsMetricLog::class);
    }

    public function save(SocialAnalyticsMetricLog $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsMetricLog $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    // Add custom queries here if needed
}
