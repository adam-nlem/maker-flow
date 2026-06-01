<?php

namespace App\Repository;

use App\Entity\Agency;
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

    public function getAccessibleByUuidForUser(string $uuid, User $user): ?HookTemplate
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.uuid = :uuid')
            ->andWhere('ht.agency = :agency')
            ->setParameter('uuid', $uuid)
            ->setParameter('agency', $user->getAgency())
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
    public function getPublicOrByAgency(Agency $agency): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.agency = :agency')
            ->setParameter('agency', $agency)
            ->orderBy('ht.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return HookTemplate[]
     */
    public function getPublicOrByAgencyPaginated(Agency $agency, int $page, int $limit): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.agency = :agency')
            ->setParameter('agency', $agency)
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
    public function searchByTitlePublicOrByAgency(string $searchTerm, Agency $agency): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.agency = :agency')
            ->andWhere('LOWER(ht.title) LIKE LOWER(:searchTerm)')
            ->setParameter('agency', $agency)
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->orderBy('ht.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return HookTemplate[]
     */
    public function searchByTitlePublicOrByAgencyPaginated(string $searchTerm, Agency $agency, int $page, int $limit): array
    {
        return $this->createQueryBuilder('ht')
            ->where('ht.isPublic = true OR ht.agency = :agency')
            ->andWhere('LOWER(ht.title) LIKE LOWER(:searchTerm)')
            ->setParameter('agency', $agency)
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->orderBy('ht.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
