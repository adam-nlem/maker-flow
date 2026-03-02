<?php

namespace App\Repository;

use App\Entity\StripeWebhookEvent;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<StripeWebhookEvent>
 */
class StripeWebhookEventRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StripeWebhookEvent::class);
    }

    public function save(StripeWebhookEvent $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getById(int $id): ?StripeWebhookEvent
    {
        return $this->createQueryBuilder('swe')
            ->where('swe.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function existsByStripeEventId(string $stripeEventId): bool
    {
        return $this->createQueryBuilder('swe')
            ->select('COUNT(swe.id)')
            ->where('swe.stripeEventId = :stripeEventId')
            ->setParameter('stripeEventId', $stripeEventId)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }
}
