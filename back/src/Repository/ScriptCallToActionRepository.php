<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptCallToAction;
use App\Entity\ScriptGeneration;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptCallToActionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptCallToAction::class);
    }

    public function save(ScriptCallToAction $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptCallToAction $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptCallToAction
    {
        return $this->createQueryBuilder('cta')
            ->where('cta.uuid = :uuid')
            ->andWhere('cta.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptCallToAction[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('cta')
            ->where('cta.script = :script')
            ->andWhere('cta.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('cta.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('cta.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('cta.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('cta')
            ->select('MAX(cta.position)')
            ->where('cta.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('cta.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('cta.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
