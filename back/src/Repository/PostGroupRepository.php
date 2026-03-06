<?php

namespace App\Repository;

use App\Entity\PostGroup;
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

    public function getByUuidAndUser(string $uuid, User $user): ?PostGroup
    {
        return $this->createQueryBuilder('pg')
            ->where('pg.uuid = :uuid')
            ->andWhere('pg.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return PostGroup[]
     */
    public function getByProjectAndUser(Project $project, User $user): array
    {
        return $this->createQueryBuilder('pg')
            ->leftJoin('pg.posts', 'p')
            ->addSelect('p')
            ->where('pg.project = :project')
            ->andWhere('pg.user = :user')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->orderBy('pg.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
