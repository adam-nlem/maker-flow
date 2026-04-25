<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptPart;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptPartRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptPart::class);
    }

    public function save(ScriptPart $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptPart $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptPart
    {
        return $this->createQueryBuilder('sp')
            ->where('sp.uuid = :uuid')
            ->andWhere('sp.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptPart[]
     */
    public function getByScriptAndUserOrderedByPosition(Script $script, User $user): array
    {
        return $this->createQueryBuilder('sp')
            ->where('sp.script = :script')
            ->andWhere('sp.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('sp.position', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScript(Script $script): int
    {
        $result = $this->createQueryBuilder('sp')
            ->select('MAX(sp.position)')
            ->where('sp.script = :script')
            ->setParameter('script', $script)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) ($result ?? -1);
    }

    public function shiftPositionsFrom(Script $script, int $fromPosition, int $delta): void
    {
        $this->createQueryBuilder('sp')
            ->update()
            ->set('sp.position', 'sp.position + :delta')
            ->where('sp.script = :script')
            ->andWhere('sp.position >= :fromPosition')
            ->setParameter('script', $script)
            ->setParameter('fromPosition', $fromPosition)
            ->setParameter('delta', $delta)
            ->getQuery()
            ->execute();
    }
}
