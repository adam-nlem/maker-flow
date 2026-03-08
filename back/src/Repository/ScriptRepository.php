<?php

namespace App\Repository;

use App\Entity\Enum\ScriptStatus;
use App\Entity\Project;
use App\Entity\Script;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\Persistence\ManagerRegistry;

class ScriptRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Script::class);
    }

    public function save(Script $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Script $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?Script
    {
        return $this->createQueryBuilder('s')
            ->where('s.uuid = :uuid')
            ->andWhere('s.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Script[]
     */
    public function getByProjectAndUser(Project $project, User $user): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Script[]
     */
    public function getByProjectAndUserPaginated(Project $project, User $user, int $page, int $limit, ?ScriptStatus $status = null): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->orderBy('s.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($status !== null) {
            $qb->andWhere('s.status = :status')
                ->setParameter('status', $status);
        }

        return $qb
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return Script[]
     */
    public function getByProjectAndUserAndMonth(Project $project, User $user, int $year, int $month): array
    {
        $startOfMonth = new \DateTimeImmutable("$year-$month-01");
        $startOfNextMonth = $startOfMonth->modify('first day of next month');

        return $this->createQueryBuilder('s')
            ->where('s.project = :project')
            ->andWhere('s.user = :user')
            ->andWhere('s.publishedAt >= :startOfMonth')
            ->andWhere('s.publishedAt < :startOfNextMonth')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->setParameter('startOfMonth', $startOfMonth)
            ->setParameter('startOfNextMonth', $startOfNextMonth)
            ->orderBy('s.publishedAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return array<string, Script[]>
     */
    public function getByProjectAndUserGroupedByStatus(Project $project, User $user, int $limit): array
    {
        $rsm = new ResultSetMappingBuilder($this->getEntityManager());
        $rsm->addRootEntityFromClassMetadata(Script::class, 's');

        $statusValues = array_map(fn(ScriptStatus $s) => "'" . $s->value . "'", ScriptStatus::cases());
        $fieldList = implode(', ', $statusValues);

        $sql = 'SELECT ' . $rsm->generateSelectClause(['s' => 'ranked']) . '
            FROM (
                SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.status ORDER BY s.updated_at DESC) AS rn
                FROM script s
                WHERE s.project_id = :projectId AND s.user_id = :userId AND s.status IS NOT NULL
            ) ranked
            WHERE ranked.rn <= :limit
            ORDER BY FIELD(ranked.status, ' . $fieldList . '), ranked.updated_at DESC';

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $query->setParameter('projectId', $project->getId());
        $query->setParameter('userId', $user->getId());
        $query->setParameter('limit', $limit);

        /** @var Script[] $scripts */
        $scripts = $query->getResult(Query::HYDRATE_SIMPLEOBJECT);

        $grouped = [];
        foreach ($scripts as $script) {
            $grouped[$script->getStatus()->value][] = $script;
        }

        return $grouped;
    }
}
