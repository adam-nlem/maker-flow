<?php

namespace App\Repository;

use App\Entity\Enum\PostInsightType;
use App\Entity\PostGroup;
use App\Entity\PostInsight;
use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class PostGroupRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostGroup::class);
    }

    public function save(PostGroup $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostGroup $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?PostGroup
    {
        return $this->createQueryBuilder('pg')
            ->join('pg.project', 'p')
            ->where('pg.uuid = :uuid')
            ->andWhere('(p.agency = :agency OR p = :clientProject)')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
            ->setParameter('clientProject', $user->getProject())
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return PostGroup[]
     */
    public function getByProjectPaginatedAndSearchTerm(
        Project $project,
        ?string $searchTerm,
        int $page,
        int $limit
    ): array {
        $qb = $this->createQueryBuilder('pg')
            ->where('pg.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pg.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($searchTerm !== null) {
            $qb->andWhere('LOWER(pg.title) LIKE LOWER(:searchTerm)')
                ->setParameter('searchTerm', '%' . $searchTerm . '%');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return int[]
     */
    public function getRankedIdsByProjectSortedByInsightValue(
        Project $project,
        PostInsightType $sortByType,
        int $page,
        int $limit,
    ): array {
        $sub = $this->getEntityManager()->createQueryBuilder()
            ->select('MAX(sub.id)')
            ->from(PostInsight::class, 'sub')
            ->innerJoin('sub.post', 'subPost')
            ->innerJoin('subPost.postGroup', 'subPg')
            ->where('subPg.project = :project')
            ->andWhere('sub.type = :type')
            ->groupBy('sub.post')
            ->getDQL();

        return $this->createQueryBuilder('pg')
            ->select('pg.id')
            ->innerJoin('pg.posts', 'p')
            ->innerJoin('p.postInsights', 'pi')
            ->where('pi.id IN (' . $sub . ')')
            ->andWhere('pg.project = :project')
            ->setParameter('project', $project)
            ->setParameter('type', $sortByType)
            ->groupBy('pg.id')
            ->orderBy('SUM(pi.value)', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getSingleColumnResult();
    }

    /**
     * @param int[] $ids
     * @return PostGroup[]
     */
    public function getByIds(array $ids): array
    {
        return $this->createQueryBuilder('pg')
            ->where('pg.id IN (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
