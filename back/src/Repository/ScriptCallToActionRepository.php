<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptCallToAction;
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
    public function getByScriptAndUserOrderedByPosition(Script $script, User $user): array
    {
        return $this->createQueryBuilder('cta')
            ->where('cta.script = :script')
            ->andWhere('cta.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('cta.position', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScript(Script $script): int
    {
        $result = $this->createQueryBuilder('cta')
            ->select('MAX(cta.position)')
            ->where('cta.script = :script')
            ->setParameter('script', $script)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
