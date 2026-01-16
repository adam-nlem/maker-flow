<?php

namespace App\Repository;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Entity\User;
use App\Entity\UserModule;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Integration>
 */
class IntegrationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Integration::class);
    }

    public function save(Integration $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Integration $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.uuid = :uuid')
            ->andWhere('i.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserPaginated(User $user, int $page, int $limit): array
    {
        $query = $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->setParameter('user', $user)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery();
        $query->setHint(Query::HINT_INCLUDE_META_COLUMNS, true);
        return $query->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserAndProviderAndAccountId(User $user, IntegrationProvider $provider, string $accountId): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.provider = :provider')
            ->andWhere('i.accountId = :accountId')
            ->setParameter('user', $user)
            ->setParameter('provider', $provider)
            ->setParameter('accountId', $accountId)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getOneByUserModuleAndProvider(UserModule $userModule, IntegrationProvider $provider): ?Integration
    {
        return $this->createQueryBuilder('i')
            ->innerJoin('i.userModules', 'um')
            ->where('um = :userModule')
            ->andWhere('i.provider = :provider')
            ->setParameter('userModule', $userModule)
            ->setParameter('provider', $provider)
            ->orderBy('i.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserModule(UserModule $userModule): array
    {
        $providers = IntegrationProvider::cases();
        $integrations = [];

        foreach ($providers as $provider) {
            $integration = $this->getOneByUserModuleAndProvider($userModule, $provider);
            if ($integration !== null) {
                $integrations[] = $integration;
            }
        }

        return $integrations;
    }
}
