<?php

namespace App\Repository;

use App\Entity\Enum\OtpType;
use App\Entity\Otp;
use App\Entity\User;
use App\Helper\DateHelper;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Otp>
 */
class OtpRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Otp::class);
    }

    public function save(Otp $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Otp $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByPendingOtpToken(string $pendingOtpToken): ?Otp
    {
        return $this->createQueryBuilder('o')
            ->where('o.pendingOtpToken = :token')
            ->setParameter('token', $pendingOtpToken)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function invalidateAllForUser(User $user, OtpType $type): void
    {
        $this->createQueryBuilder('o')
            ->update()
            ->set('o.usedAt', ':now')
            ->where('o.user = :user')
            ->andWhere('o.type = :type')
            ->andWhere('o.usedAt IS NULL')
            ->setParameter('now', DateHelper::createUtcDateTimeImmutable())
            ->setParameter('user', $user)
            ->setParameter('type', $type->value)
            ->getQuery()
            ->execute();
    }
}
