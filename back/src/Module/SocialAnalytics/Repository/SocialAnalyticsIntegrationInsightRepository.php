<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Entity\Integration;
use App\Entity\User;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<SocialAnalyticsIntegrationInsight>
 */
class SocialAnalyticsIntegrationInsightRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialAnalyticsIntegrationInsight::class);
    }

    public function save(SocialAnalyticsIntegrationInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(SocialAnalyticsIntegrationInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLatestByUserAndByIntegration(
        User $user,
        Integration $integration,
    ): array {

        $subQuery = $this->createQueryBuilder('si')
            ->select('MAX(si.id)')
            ->where('si.user = :user')
            ->andWhere('si.integration = :integration')
            ->groupBy('si.type')
            ->getDQL();

        return $this->createQueryBuilder('i')
            ->where("i.id IN ($subQuery)")
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
