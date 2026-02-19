<?php

namespace App\Module\SocialAnalytics\Repository;

use App\Entity\Integration;
use App\Module\SocialAnalytics\Entity\Enum\YoutubeReportType;
use App\Module\SocialAnalytics\Entity\YoutubeReportingJob;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<YoutubeReportingJob>
 */
class YoutubeReportingJobRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, YoutubeReportingJob::class);
    }

    public function save(YoutubeReportingJob $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(YoutubeReportingJob $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByIntegrationAndReportType(Integration $integration, YoutubeReportType $reportType): ?YoutubeReportingJob
    {
        return $this->createQueryBuilder('j')
            ->where('j.integration = :integration')
            ->andWhere('j.reportType = :reportType')
            ->setParameter('integration', $integration)
            ->setParameter('reportType', $reportType)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return YoutubeReportingJob[]
     */
    public function getByIntegration(Integration $integration): array
    {
        return $this->createQueryBuilder('j')
            ->where('j.integration = :integration')
            ->setParameter('integration', $integration)
            ->getQuery()
            ->getResult();
    }
}
