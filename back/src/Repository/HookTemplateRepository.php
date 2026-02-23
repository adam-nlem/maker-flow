<?php

namespace App\Repository;

use App\Entity\HookTemplate;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<HookTemplate>
 */
class HookTemplateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, HookTemplate::class);
    }

    public function save(HookTemplate $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(HookTemplate $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?HookTemplate
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.uuid = :uuid')
            ->andWhere('ht.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuid(string $uuid): ?HookTemplate
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return HookTemplate[]
     */
    public function getPublicOrByUser(User $user): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.user = :user')
            ->setParameter('user', $user)
            ->orderBy('ht.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return HookTemplate[]
     */
    public function getPublicOrByUserPaginated(User $user, int $page, int $limit): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.user = :user')
            ->setParameter('user', $user)
            ->orderBy('ht.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return HookTemplate[]
     */
    public function searchByTitlePublicOrByUser(string $searchTerm, User $user): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.user = :user')
            ->andWhere('LOWER(ht.title) LIKE LOWER(:searchTerm)')
            ->setParameter('user', $user)
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->orderBy('ht.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return HookTemplate[]
     */
    public function searchByTitlePublicOrByUserPaginated(string $searchTerm, User $user, int $page, int $limit): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.user = :user')
            ->andWhere('LOWER(ht.title) LIKE LOWER(:searchTerm)')
            ->setParameter('user', $user)
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->orderBy('ht.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
