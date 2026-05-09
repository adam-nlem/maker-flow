<?php

namespace App\Repository;

use App\Entity\Project;
use App\Entity\ScriptTag;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptTagRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptTag::class);
    }

    public function save(ScriptTag $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptTag $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?ScriptTag
    {
        return $this->createQueryBuilder('t')
            ->join('t.project', 'p')
            ->where('t.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptTag[]
     */
    public function getByProjectLimited(Project $project, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.project = :project')
            ->setParameter('project', $project)
            ->setMaxResults($limit)
            ->addOrderBy(
                'CASE WHEN t.updatedAt IS NOT NULL THEN t.updatedAt ELSE t.createdAt END',
                'DESC'
            )
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptTag[]
     */
    public function getBySearchTermAndProjectLimited(string $searchTerm, Project $project, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.project = :project')
            ->andWhere('LOWER(t.title) LIKE LOWER(:searchTerm)')
            ->setParameter('project', $project)
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->setMaxResults($limit)
            ->addOrderBy(
                'CASE WHEN t.updatedAt IS NOT NULL THEN t.updatedAt ELSE t.createdAt END',
                'DESC'
            )
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByTitleAndProject(string $title, Project $project): ?ScriptTag
    {
        return $this->createQueryBuilder('t')
            ->where('t.title = :title')
            ->andWhere('t.project = :project')
            ->setParameter('title', $title)
            ->setParameter('project', $project)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param string[] $uuids
     * @return ScriptTag[]
     */
    public function getByProjectAndWithUuidIn(Project $project, array $uuids): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.project = :project')
            ->andWhere('t.uuid IN (:uuids)')
            ->setParameter('project', $project)
            ->setParameter('uuids', $uuids)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
