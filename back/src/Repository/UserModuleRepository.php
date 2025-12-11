<?php

namespace App\Repository;

use App\Entity\Module;
use App\Entity\Project;
use App\Entity\User;
use App\Entity\UserModule;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<UserModule>
 */
class UserModuleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserModule::class);
    }

    public function save(UserModule $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(UserModule $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUserAndProject(User $user, Project $project): array
    {
        return $this->createQueryBuilder('um')
            ->where('um.user = :user')
            ->andWhere('um.project = :project')
            ->setParameter('user', $user)
            ->setParameter('project', $project)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndUser(string $uuid, User $user): ?UserModule
    {
        return $this->createQueryBuilder('um')
            ->where('um.uuid = :uuid')
            ->andWhere('um.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    // This returnes one or null result because the user is not supposed to have
    // two user modules for the same module in the same project
    // ie. one instance of a module per project
    public function getByUserAndProjectAndModule(User $user, Project $project, Module $module): ?UserModule {
        return $this->createQueryBuilder('um')
            ->where('um.user = :user')
            ->andWhere('um.project = :project')
            ->andWhere('um.module = :module')
            ->setParameter('user', $user)
            ->setParameter('project', $project)
            ->setParameter('module', $module)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
