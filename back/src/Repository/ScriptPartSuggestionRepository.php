<?php

namespace App\Repository;

use App\Entity\Enum\ScriptPartSuggestionStatus;
use App\Entity\Script;
use App\Entity\ScriptPart;
use App\Entity\ScriptPartSuggestion;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptPartSuggestionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptPartSuggestion::class);
    }

    public function save(ScriptPartSuggestion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptPartSuggestion $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?ScriptPartSuggestion
    {
        return $this->createQueryBuilder('sps')
            ->join('sps.script', 's')
            ->join('s.project', 'p')
            ->where('sps.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptPartSuggestion[]
     */
    public function getByScript(Script $script, ?ScriptPartSuggestionStatus $status = null): array
    {
        $qb = $this->createQueryBuilder('sps')
            ->where('sps.script = :script')
            ->setParameter('script', $script)
            ->orderBy('sps.createdAt', 'ASC');

        if ($status !== null) {
            $qb->andWhere('sps.status = :status')
               ->setParameter('status', $status);
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptPartSuggestion[]
     */
    public function getPendingByScriptPart(ScriptPart $scriptPart): array
    {
        return $this->createQueryBuilder('sps')
            ->where('sps.scriptPart = :scriptPart')
            ->andWhere('sps.status = :status')
            ->setParameter('scriptPart', $scriptPart)
            ->setParameter('status', ScriptPartSuggestionStatus::Pending)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
