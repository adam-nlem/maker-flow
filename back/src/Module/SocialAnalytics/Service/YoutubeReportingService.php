<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostInsightDTO;
use App\Module\SocialAnalytics\Entity\Enum\InsightValueFormat;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\Enum\YoutubeLiveOrOnDemand;
use App\Module\SocialAnalytics\Entity\Enum\YoutubeReportType;
use App\Module\SocialAnalytics\Entity\Enum\YoutubeSubscribedStatus;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsightBreakdown;
use App\Module\SocialAnalytics\Entity\YoutubeReportingJob;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightBreakdownRepository;
use App\Module\SocialAnalytics\Repository\YoutubeReportingJobRepository;
use Google\Client;
use Google\Service\YouTubeReporting;
use Google\Service\YouTubeReporting\Job as ReportingJob;
use Google\Service\YouTubeReporting\Report;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class YoutubeReportingService
{
    public function __construct(
        private readonly Client $googleClient,
        private readonly YoutubeReportingJobRepository $reportingJobRepository,
        private readonly SocialAnalyticsPostInsightBreakdownRepository $breakdownRepository,
        private readonly HttpClientInterface $httpClient,
    ) {}

    /**
     * Ensures reporting jobs exist for each YoutubeReportType.
     * Creates them on Google's side if missing.
     *
     * @return YoutubeReportingJob[]
     */
    public function ensureJobsExist(Integration $integration): array
    {
        $reporting = new YouTubeReporting($this->googleClient);
        $jobs = [];

        foreach (YoutubeReportType::cases() as $reportType) {
            $existingJob = $this->reportingJobRepository->getByIntegrationAndReportType(
                $integration,
                $reportType,
            );

            if ($existingJob !== null) {
                $jobs[] = $existingJob;
                continue;
            }

            // Check if Google already has a job for this report type
            $googleJob = $this->findExistingGoogleJob($reporting, $reportType->value);

            if ($googleJob === null) {
                // Create new job on Google's side
                $newJob = new ReportingJob();
                $newJob->setReportTypeId($reportType->value);
                $newJob->setName('MakerFlow - ' . $reportType->value);
                $googleJob = $reporting->jobs->create($newJob);
            }

            // Persist in our DB
            $job = new YoutubeReportingJob();
            $job->setExternalJobId($googleJob->getId())
                ->setReportType($reportType)
                ->setIntegration($integration)
                ->setUser($integration->getUser());

            $this->reportingJobRepository->save($job, true);
            $jobs[] = $job;
        }

        return $jobs;
    }

    /**
     * Gets the latest unprocessed report for a given job.
     */
    public function getLatestUnprocessedReport(YoutubeReportingJob $job): ?Report
    {
        $reportingApi = new YouTubeReporting($this->googleClient);

        $params = ['jobId' => $job->getExternalJobId()];

        if ($job->getLastProcessedReportDate() !== null) {
            $params['createdAfter'] = $job->getLastProcessedReportDate()->format(DateHelper::FORMAT_ISO8601_UTC);
        }

        $reportsResponse = $reportingApi->jobs_reports->listJobsReports($job->getExternalJobId(), $params);
        $reports = $reportsResponse->getReports();

        if (empty($reports)) {
            return null;
        }

        // Return the most recent report (last in the list)
        $latestReport = null;
        $latestCreateTime = null;

        foreach ($reports as $report) {
            if ($report->getId() === $job->getLastProcessedReportId()) {
                continue;
            }

            $createTime = $report->getCreateTime();
            if ($latestCreateTime === null || $createTime > $latestCreateTime) {
                $latestCreateTime = $createTime;
                $latestReport = $report;
            }
        }

        return $latestReport;
    }

    /**
     * Downloads the CSV content of a report.
     */
    public function downloadReportCsv(Report $report, string $accessToken): string
    {
        $response = $this->httpClient->request('GET', $report->getDownloadUrl(), [
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
            ],
        ]);

        return $response->getContent();
    }

    /**
     * Parses CSV content into rows.
     *
     * @return array<int, array<string, string>>
     */
    public function parseCsvToRows(string $csvContent): array
    {
        $lines = explode("\n", trim($csvContent));

        if (count($lines) < 2) {
            return [];
        }

        $headers = str_getcsv(array_shift($lines));
        $rows = [];

        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }

            $values = str_getcsv($line);
            $row = [];

            foreach ($headers as $index => $header) {
                $row[$header] = $values[$index] ?? '';
            }

            $rows[] = $row;
        }

        return $rows;
    }

    /**
     * Processes basic report (channel_basic_a3) rows.
     * Returns aggregated data per video_id for dashboard insights
     * and stores breakdown rows in the database.
     *
     * @param array<int, array<string, string>> $rows
     * @param array<string, SocialAnalyticsPost> $postsByExternalId
     * @return array<string, array<string, float>> Aggregated metrics per video_id
     */
    public function processBasicReportRows(
        array $rows,
        array $postsByExternalId,
        Integration $integration,
    ): array {
        $aggregated = [];
        $breakdownEntities = [];

        foreach ($rows as $row) {
            $videoId = $row['video_id'] ?? null;

            if ($videoId === null || !isset($postsByExternalId[$videoId])) {
                continue;
            }

            $post = $postsByExternalId[$videoId];
            $date = DateHelper::createUtcDateTimeImmutable($row['date'] ?? 'now');
            $countryCode = $row['country_code'] ?? null;
            $subscribedStatus = isset($row['subscribed_status'])
                ? YoutubeSubscribedStatus::tryFrom($row['subscribed_status'])
                : null;
            $liveOrOnDemand = isset($row['live_or_on_demand'])
                ? YoutubeLiveOrOnDemand::tryFrom($row['live_or_on_demand'])
                : null;

            // Aggregate metrics per video_id
            foreach (YoutubePostInsightDTO::getReportingMetricMapping() as $csvColumn => $insightType) {
                $rawValue = (float) ($row[$csvColumn] ?? 0);

                if (!isset($aggregated[$videoId])) {
                    $aggregated[$videoId] = [];
                }

                if (!isset($aggregated[$videoId][$csvColumn])) {
                    $aggregated[$videoId][$csvColumn] = 0.0;
                }

                $aggregated[$videoId][$csvColumn] += $rawValue;

                // Store breakdown entity
                $breakdown = new SocialAnalyticsPostInsightBreakdown();
                $breakdown->setType($insightType)
                    ->setValue($rawValue)
                    ->setValueFormat($insightType->getValueFormat())
                    ->setDate($date)
                    ->setCountryCode($countryCode)
                    ->setSubscribedStatus($subscribedStatus)
                    ->setLiveOrOnDemand($liveOrOnDemand)
                    ->setSocialAnalyticsPost($post)
                    ->setUser($integration->getUser());

                $breakdownEntities[] = $breakdown;
            }
        }

        if (!empty($breakdownEntities)) {
            $this->breakdownRepository->bulkSave($breakdownEntities);
        }

        return $aggregated;
    }

    /**
     * Marks a report as processed for a given job.
     */
    public function markReportProcessed(YoutubeReportingJob $job, Report $report): void
    {
        $job->setLastProcessedReportId($report->getId());
        $job->setLastProcessedReportDate(DateHelper::createUtcDateTimeImmutable($report->getCreateTime()));

        $this->reportingJobRepository->save($job, true);
    }

    private function findExistingGoogleJob(YouTubeReporting $reporting, string $reportTypeId): ?ReportingJob
    {
        $jobsResponse = $reporting->jobs->listJobs();

        foreach ($jobsResponse->getJobs() as $job) {
            if ($job->getReportTypeId() === $reportTypeId) {
                return $job;
            }
        }

        return null;
    }
}
