<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptChapter;
use App\Entity\ScriptGeneration;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptChapterRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptChapter::class);
    }

    public function save(ScriptChapter $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptChapter $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptChapter
    {
        return $this->createQueryBuilder('c')
            ->where('c.uuid = :uuid')
            ->andWhere('c.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptChapter[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('c')
            ->where('c.script = :script')
            ->andWhere('c.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('c.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('c.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('c.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('MAX(c.position)')
            ->where('c.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('c.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('c.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
