<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SocialAnalyticsPostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsPost::class);
    }

    public function save(SocialAnalyticsPost $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsPost $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    // Add custom queries here if needed
}
