<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptGeneration;
use App\Entity\ScriptVoiceOver;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptVoiceOverRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptVoiceOver::class);
    }

    public function save(ScriptVoiceOver $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptVoiceOver $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptVoiceOver
    {
        return $this->createQueryBuilder('v')
            ->where('v.uuid = :uuid')
            ->andWhere('v.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptVoiceOver[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('v')
            ->where('v.script = :script')
            ->andWhere('v.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('v.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('v.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('v.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('v')
            ->select('MAX(v.position)')
            ->where('v.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('v.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('v.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }

    public function deleteByGeneration(ScriptGeneration $generation): void
    {
        $this->createQueryBuilder('v')
            ->delete()
            ->where('v.scriptGeneration = :generation')
            ->setParameter('generation', $generation)
            ->getQuery()
            ->execute();
    }
}
