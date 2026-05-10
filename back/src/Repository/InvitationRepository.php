<?php

namespace App\Repository;

use App\Entity\Agency;
use App\Entity\Enum\InvitationType;
use App\Entity\Invitation;
use App\Entity\Project;
use App\Helper\DateHelper;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Invitation>
 */
class InvitationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Invitation::class);
    }

    public function save(Invitation $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Invitation $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByToken(string $token): ?Invitation
    {
        return $this->createQueryBuilder('i')
            ->where('i.token = :token')
            ->setParameter('token', $token)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function invalidatePendingForCollaborator(string $email, Agency $agency): void
    {
        $this->createQueryBuilder('i')
            ->update()
            ->set('i.usedAt', ':now')
            ->where('i.email = :email')
            ->andWhere('i.agency = :agency')
            ->andWhere('i.type = :type')
            ->andWhere('i.usedAt IS NULL')
            ->setParameter('now', DateHelper::createUtcDateTimeImmutable())
            ->setParameter('email', $email)
            ->setParameter('agency', $agency)
            ->setParameter('type', InvitationType::Collaborator->value)
            ->getQuery()
            ->execute();
    }

    public function invalidatePendingForClient(string $email, Project $project): void
    {
        $this->createQueryBuilder('i')
            ->update()
            ->set('i.usedAt', ':now')
            ->where('i.email = :email')
            ->andWhere('i.project = :project')
            ->andWhere('i.type = :type')
            ->andWhere('i.usedAt IS NULL')
            ->setParameter('now', DateHelper::createUtcDateTimeImmutable())
            ->setParameter('email', $email)
            ->setParameter('project', $project)
            ->setParameter('type', InvitationType::Client->value)
            ->getQuery()
            ->execute();
    }

    /**
     * @return Invitation[]
     */
    public function findPendingForAgency(Agency $agency): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.agency = :agency')
            ->andWhere('i.type = :type')
            ->andWhere('i.usedAt IS NULL')
            ->andWhere('i.expiresAt > :now')
            ->setParameter('agency', $agency)
            ->setParameter('type', InvitationType::Collaborator->value)
            ->setParameter('now', DateHelper::createUtcDateTimeImmutable())
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Invitation[]
     */
    public function findPendingForProject(Project $project): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.project = :project')
            ->andWhere('i.type = :type')
            ->andWhere('i.usedAt IS NULL')
            ->andWhere('i.expiresAt > :now')
            ->setParameter('project', $project)
            ->setParameter('type', InvitationType::Client->value)
            ->setParameter('now', DateHelper::createUtcDateTimeImmutable())
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
