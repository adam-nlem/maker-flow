<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptGeneration;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptGenerationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptGeneration::class);
    }

    public function save(ScriptGeneration $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptGeneration $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }


    public function getById(int $id): ?ScriptGeneration
    {
        return $this->createQueryBuilder('sg')
            ->where('sd.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
    public function getByUuidAndUser(string $uuid, User $user): ?ScriptGeneration
    {
        return $this->createQueryBuilder('sg')
            ->where('sg.uuid = :uuid')
            ->andWhere('sg.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getLatestByScriptAndUser(Script $script, User $user): ?ScriptGeneration
    {
        return $this->createQueryBuilder('sg')
            ->where('sg.script = :script')
            ->andWhere('sg.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('sg.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
