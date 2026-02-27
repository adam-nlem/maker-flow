<?php

namespace App\Repository;

use App\Entity\Script;
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
    public function getByScriptAndUserOrderedByPosition(Script $script, User $user): array
    {
        return $this->createQueryBuilder('rc')
            ->where('rc.script = :script')
            ->andWhere('rc.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('rc.position', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScript(Script $script): int
    {
        $result = $this->createQueryBuilder('rc')
            ->select('MAX(rc.position)')
            ->where('rc.script = :script')
            ->setParameter('script', $script)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
