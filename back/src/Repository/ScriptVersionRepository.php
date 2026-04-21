<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptVersion;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptVersionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptVersion::class);
    }

    public function save(ScriptVersion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptVersion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByScriptAndUserPaginated(Script $script, User $user, int $page, int $limit): array
    {
        return $this->createQueryBuilder('sv')
            ->where('sv.script = :script')
            ->andWhere('sv.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('sv.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptVersion
    {
        return $this->createQueryBuilder('sv')
            ->where('sv.uuid = :uuid')
            ->andWhere('sv.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
