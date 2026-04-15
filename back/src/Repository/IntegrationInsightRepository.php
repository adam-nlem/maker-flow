<?php

namespace App\Repository;

use App\Entity\Integration;
use App\Entity\User;
use App\Entity\Enum\IntegrationInsightType;
use App\Entity\IntegrationInsight;
use App\Entity\Project;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<IntegrationInsight>
 */
class IntegrationInsightRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IntegrationInsight::class);
    }

    public function save(IntegrationInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(IntegrationInsight $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLatestByUserAndByIntegration(
        User $user,
        Integration $integration,
    ): array {

        $subQuery = $this->createQueryBuilder('si')
            ->select('MAX(si.createdAt)')
            ->where('si.user = :user')
            ->andWhere('si.integration = :integration')
            ->andWhere('si.type = i.type')
            ->getDQL();

        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.integration = :integration')
            ->andWhere("i.createdAt = ($subQuery)")
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getLatestByIntegrationAndByTypeAndByValue(
        Integration $integration,
        IntegrationInsightType $type,
        float $value,
    ): ?IntegrationInsight {
        return $this->createQueryBuilder('ii')
            ->where('ii.integration = :integration')
            ->andWhere('ii.type = :type')
            ->andWhere('ii.value = :value')
            ->setParameter('integration', $integration)
            ->setParameter('type', $type)
            ->setParameter('value', $value)
            ->orderBy('ii.createdAt', 'DESC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getLatestByUserAndByIntegrationAndByType(
        User $user,
        Integration $integration,
        IntegrationInsightType $type,
    ): ?IntegrationInsight {
        return $this->createQueryBuilder('ii')
            ->where('ii.user = :user')
            ->andWhere('ii.integration = :integration')
            ->andWhere('ii.type = :type')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('type', $type)
            ->orderBy('ii.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUserAndIntegrationAndTimePeriod(
        User $user,
        Integration $integration,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $subQuery = $this->createQueryBuilder('si')
            ->select('MAX(si.createdAt)')
            ->where('si.user = :user')
            ->andWhere('si.integration = :integration')
            ->andWhere('si.createdAt >= :startDate')
            ->andWhere('si.createdAt <= :endDate')
            ->andWhere('si.type = i.type')
            ->getDQL();

        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.integration = :integration')
            ->andWhere('i.createdAt >= :startDate')
            ->andWhere('i.createdAt <= :endDate')
            ->andWhere("i.createdAt = ($subQuery)")
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @param IntegrationInsightType[] $types
     * @return IntegrationInsight[]
     */
    public function getDailyByUserAndIntegrationAndTypes(
        User $user,
        Integration $integration,
        array $types,
        \DateTimeImmutable $startDate,
    ): array {
        return $this->createQueryBuilder('i')
            ->where('i.user = :user')
            ->andWhere('i.integration = :integration')
            ->andWhere('i.type IN (:types)')
            ->andWhere('i.createdAt >= :startDate')
            ->setParameter('user', $user)
            ->setParameter('integration', $integration)
            ->setParameter('types', $types)
            ->setParameter('startDate', $startDate)
            ->orderBy('i.createdAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * Returns the latest TotalFollowers value per integration for a given project/user, keyed by integration id.
     *
     * @return array<int, float>
     */
    public function getLatestTotalFollowersByProjectAndUserGroupedByIntegration(
        Project $project,
        User $user,
    ): array {
        $sub = $this->getEntityManager()->createQueryBuilder()
            ->select('MAX(sub.id)')
            ->from(IntegrationInsight::class, 'sub')
            ->innerJoin('sub.integration', 'subInt')
            ->where('subInt.project = :project')
            ->andWhere('sub.user = :user')
            ->andWhere('sub.type = :type')
            ->groupBy('sub.integration')
            ->getDQL();

        $rows = $this->createQueryBuilder('ii')
            ->select('IDENTITY(ii.integration) AS integrationId', 'ii.value AS value')
            ->where('ii.id IN (' . $sub . ')')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->setParameter('type', IntegrationInsightType::TotalFollowers)
            ->getQuery()
            ->getArrayResult();

        $followersByIntegrationId = [];
        foreach ($rows as $row) {
            $followersByIntegrationId[(int) $row['integrationId']] = (float) $row['value'];
        }

        return $followersByIntegrationId;
    }

    /**
     * Returns the SUM of the latest TotalFollowers per integration before a given date.
     */
    public function getAggregatedTotalFollowersByProjectAndUserBeforeDate(
        Project $project,
        User $user,
        \DateTimeImmutable $atDate,
    ): ?float {
        $sub = $this->getEntityManager()->createQueryBuilder()
            ->select('MAX(sub.id)')
            ->from(IntegrationInsight::class, 'sub')
            ->innerJoin('sub.integration', 'subInt')
            ->where('subInt.project = :project')
            ->andWhere('sub.user = :user')
            ->andWhere('sub.type = :type')
            ->andWhere('sub.createdAt <= :atDate')
            ->groupBy('sub.integration')
            ->getDQL();

        $result = $this->createQueryBuilder('ii')
            ->select('SUM(ii.value) as totalValue')
            ->where('ii.id IN (' . $sub . ')')
            ->setParameter('project', $project)
            ->setParameter('user', $user)
            ->setParameter('type', IntegrationInsightType::TotalFollowers)
            ->setParameter('atDate', $atDate)
            ->getQuery()
            ->getSingleScalarResult();

        return $result !== null ? (float) $result : null;
    }
}
