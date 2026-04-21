<?php

namespace App\Repository;

use App\Entity\CreatorProfile;
use App\Entity\TargetAudience;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class TargetAudienceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TargetAudience::class);
    }

    public function save(TargetAudience $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TargetAudience $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByCreatorProfile(CreatorProfile $creatorProfile): array
    {
        return $this->createQueryBuilder('ta')
            ->where('ta.creatorProfile = :creatorProfile')
            ->setParameter('creatorProfile', $creatorProfile)
            ->orderBy('ta.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndUser(string $uuid, User $user): ?TargetAudience
    {
        return $this->createQueryBuilder('ta')
            ->where('ta.uuid = :uuid')
            ->andWhere('ta.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
