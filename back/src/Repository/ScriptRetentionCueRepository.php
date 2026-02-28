<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptGeneration;
use App\Entity\ScriptRetentionCue;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptRetentionCueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptRetentionCue::class);
    }

    public function save(ScriptRetentionCue $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptRetentionCue $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptRetentionCue
    {
        return $this->createQueryBuilder('rc')
            ->where('rc.uuid = :uuid')
            ->andWhere('rc.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptRetentionCue[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('rc')
            ->where('rc.script = :script')
            ->andWhere('rc.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('rc.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('rc.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('rc.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('rc')
            ->select('MAX(rc.position)')
            ->where('rc.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('rc.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('rc.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
