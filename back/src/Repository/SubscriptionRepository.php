<?php

namespace App\Repository;

use App\Entity\Agency;
use App\Entity\Enum\SubscriptionStatus;
use App\Entity\Subscription;
use App\Helper\DateHelper;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Subscription>
 */
class SubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    public function save(Subscription $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Subscription $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLatestActiveByAgency(Agency $agency): ?Subscription
    {
        return $this->createQueryBuilder('s')
            ->where('s.agency = :agency')
            ->andWhere('s.status = :status')
            ->andWhere('s.currentPeriodEnd >= :now')
            ->setParameter('agency', $agency)
            ->setParameter('status', SubscriptionStatus::Active)
            ->setParameter('now', DateHelper::createUtcDateTimeImmutable())
            ->orderBy('s.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getLatestByAgency(Agency $agency): ?Subscription
    {
        return $this->createQueryBuilder('s')
            ->where('s.agency = :agency')
            ->setParameter('agency', $agency)
            ->orderBy('s.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByStripeSubscriptionId(string $stripeSubscriptionId): ?Subscription
    {
        return $this->createQueryBuilder('s')
            ->where('s.stripeSubscriptionId = :stripeSubscriptionId')
            ->setParameter('stripeSubscriptionId', $stripeSubscriptionId)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
