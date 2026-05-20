<?php

namespace App\Repository;

use App\Entity\Enum\PostDraftStatus;
use App\Entity\PostDraft;
use App\Entity\PostDraftMediaVersion;
use App\Entity\Project;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PostDraft>
 */
class PostDraftRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostDraft::class);
    }

    public function save(PostDraft $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostDraft $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuid(string $uuid): ?PostDraft
    {
        return $this->createQueryBuilder('pd')
            ->where('pd.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndProject(string $uuid, Project $project): ?PostDraft
    {
        return $this->createQueryBuilder('pd')
            ->where('pd.uuid = :uuid')
            ->andWhere('pd.project = :project')
            ->setParameter('uuid', $uuid)
            ->setParameter('project', $project)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return PostDraft[]
     */
    public function getByProjectPaginated(
        Project $project,
        int $page,
        int $limit,
        ?PostDraftStatus $status = null,
        ?string $searchTerm = null,
    ): array {
        $qb = $this->createQueryBuilder('pd')
            ->where('pd.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pd.updatedAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($status !== null) {
            $qb->innerJoin('pd.mediaVersions', 'mv')
                ->andWhere('mv.status = :status')
                ->andWhere('NOT EXISTS (
                    SELECT 1 FROM ' . PostDraftMediaVersion::class . ' mvLater
                    WHERE mvLater.postDraft = pd AND mvLater.createdAt > mv.createdAt
                )')
                ->setParameter('status', $status);
        }

        if ($searchTerm !== null) {
            $qb->andWhere('LOWER(pd.title) LIKE LOWER(:searchTerm)')
                ->setParameter('searchTerm', '%' . $searchTerm . '%');
        }

        return $qb
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function countByProject(Project $project): int
    {
        return (int) $this->createQueryBuilder('pd')
            ->select('COUNT(pd.id)')
            ->where('pd.project = :project')
            ->setParameter('project', $project)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
