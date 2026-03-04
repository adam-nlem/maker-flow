<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptGeneration;
use App\Entity\ScriptShot;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptShotRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptShot::class);
    }

    public function save(ScriptShot $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptShot $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptShot
    {
        return $this->createQueryBuilder('sh')
            ->where('sh.uuid = :uuid')
            ->andWhere('sh.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptShot[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('sh')
            ->where('sh.script = :script')
            ->andWhere('sh.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('sh.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('sh.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('sh.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('sh')
            ->select('MAX(sh.position)')
            ->where('sh.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('sh.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('sh.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }

    public function deleteByGeneration(ScriptGeneration $generation): void
    {
        $this->createQueryBuilder('sh')
            ->delete()
            ->where('sh.scriptGeneration = :generation')
            ->setParameter('generation', $generation)
            ->getQuery()
            ->execute();
    }
}
