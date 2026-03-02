<?php

namespace App\Repository;

use App\Entity\StripeWebhookEvent;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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
