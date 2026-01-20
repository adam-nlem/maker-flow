<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Entity\Integration;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

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

    public function getByExternalIdAndIntegration(string $externalId, Integration $integration): ?SocialAnalyticsPost
    {
        return $this->createQueryBuilder('p')
            ->where('p.externalId = :externalId')
            ->andWhere('p.integration = :integration')
            ->setParameter('externalId', $externalId)
            ->setParameter('integration', $integration)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
