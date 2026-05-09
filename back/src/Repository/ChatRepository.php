<?php

namespace App\Repository;

use App\Entity\Chat;
use App\Entity\Script;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ChatRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Chat::class);
    }

    public function save(Chat $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Chat $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByScriptPaginated(Script $script, int $page, int $limit): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.script = :script')
            ->setParameter('script', $script)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?Chat
    {
        return $this->createQueryBuilder('c')
            ->join('c.script', 's')
            ->join('s.project', 'p')
            ->where('c.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
