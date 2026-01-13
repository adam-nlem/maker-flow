<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostGroup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SocialAnalyticsPostGroupRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsPostGroup::class);
    }

    public function save(SocialAnalyticsPostGroup $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsPostGroup $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    // Add custom queries here if needed
}
