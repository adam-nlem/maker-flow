<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptDialogue;
use App\Entity\ScriptGeneration;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptDialogueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptDialogue::class);
    }

    public function save(ScriptDialogue $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptDialogue $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptDialogue
    {
        return $this->createQueryBuilder('d')
            ->where('d.uuid = :uuid')
            ->andWhere('d.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptDialogue[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('d')
            ->where('d.script = :script')
            ->andWhere('d.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('d.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('d.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('d.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('d')
            ->select('MAX(d.position)')
            ->where('d.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('d.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('d.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
