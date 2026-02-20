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

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptTag
    {
        return $this->createQueryBuilder('t')
            ->where('t.uuid = :uuid')
            ->andWhere('t.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptTag[]
     */
    public function getByUserAndProjectLimited(User $user, Project $project, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.user = :user')
            ->andWhere('t.project = :project')
            ->setParameter('user', $user)
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
    public function getBySearchTermAndUserAndProjectLimited(string $searchTerm, User $user, Project $project, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.user = :user')
            ->andWhere('t.project = :project')
            ->andWhere('LOWER(t.title) LIKE LOWER(:searchTerm)')
            ->setParameter('user', $user)
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

    public function getByTitleAndProjectAndUser(string $title, Project $project, User $user): ?ScriptTag
    {
        return $this->createQueryBuilder('t')
            ->where('t.title = :title')
            ->andWhere('t.project = :project')
            ->andWhere('t.user = :user')
            ->setParameter('title', $title)
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param string[] $uuids
     * @return ScriptTag[]
     */
    public function getByUserAndWithUuidIn(User $user, array $uuids): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.user = :user')
            ->andWhere('t.uuid IN (:uuids)')
            ->setParameter('user', $user)
            ->setParameter('uuids', $uuids)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
