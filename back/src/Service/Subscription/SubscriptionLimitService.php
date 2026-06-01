<?php

namespace App\Service\Subscription;

use App\DTO\ReviewUploadMetricsDTO;
use App\DTO\Response\Agency\AgencyUsageResponseDTO;
use App\DTO\Response\Subscription\PlanConfigResponseDTO;
use App\Entity\Agency;
use App\Entity\Enum\MediaType;
use App\Entity\Project;
use App\Exception\AgencyCollaborator\EditorCollaboratorLimitReachedException;
use App\Exception\Project\ProjectLimitReachedException;
use App\Exception\Review\StorageLimitReachedException;
use App\Exception\Review\VideoHoursLimitReachedException;
use App\Exception\Script\ScriptLimitReachedException;
use App\Repository\InvitationRepository;
use App\Repository\ProjectRepository;
use App\Repository\ReviewVersionRepository;
use App\Repository\ScriptRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Service\Review\ReviewFileService;
use App\Service\Review\ReviewVideoStreamingService;
use App\Service\Stripe\StripePlanService;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class SubscriptionLimitService
{
    private const BYTES_PER_GB = 1024 * 1024 * 1024;
    private const SECONDS_PER_HOUR = 3600;

    public function __construct(
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly StripePlanService $stripePlanService,
        private readonly UserRepository $userRepository,
        private readonly InvitationRepository $invitationRepository,
        private readonly ReviewVersionRepository $reviewVersionRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly ScriptRepository $scriptRepository,
        private readonly ReviewFileService $reviewFileService,
        private readonly ReviewVideoStreamingService $reviewVideoStreamingService,
    ) {}

    public function assertCanCreateProject(Agency $agency): void
    {
        $planConfig = $this->getPlanConfig($agency);
        $max = $planConfig !== null ? $planConfig->getMaxProjects() : 1;

        if ($max !== null && $this->projectRepository->countByAgency($agency) >= $max) {
            throw new ProjectLimitReachedException();
        }
    }

    public function assertCanCreateScript(Project $project): void
    {
        $planConfig = $this->getPlanConfig($project->getAgency());
        $max = $planConfig !== null ? $planConfig->getMaxScriptsPerProject() : 1;

        if ($max !== null && $this->scriptRepository->countByProject($project) >= $max) {
            throw new ScriptLimitReachedException();
        }
    }

    public function assertCanInviteEditor(Agency $agency): void
    {
        $planConfig = $this->getPlanConfig($agency);
        $max = $planConfig !== null ? $planConfig->getMaxEditorCollaborators() : 0;

        if ($max === null) {
            return;
        }

        $used = $this->userRepository->countActiveEditorsByAgency($agency)
            + $this->invitationRepository->countPendingEditorInvitationsByAgency($agency);

        if ($used >= $max) {
            throw new EditorCollaboratorLimitReachedException();
        }
    }

    /**
     * Compute the size and video-duration cost of an upload, then assert it fits the
     * agency's current plan limits. Returns the computed metrics so the caller can
     * persist them on the ReviewVersion entity.
     *
     * @param UploadedFile[] $files
     */
    public function assertCanUploadReviewVersion(Agency $agency, array $files, MediaType $mediaType): ReviewUploadMetricsDTO
    {
        $fileSizeBytes = $this->reviewFileService->computeTotalSize($files);
        $durationSeconds = $mediaType === MediaType::Video
            ? $this->reviewVideoStreamingService->probeDurationSeconds($files[0]->getRealPath())
            : null;

        $planConfig = $this->getPlanConfig($agency);

        if ($durationSeconds !== null) {
            $maxHours = $planConfig !== null ? $planConfig->getMaxVideoUploadHours() : 0;

            if ($maxHours !== null) {
                $current = $this->reviewVersionRepository->sumVideoSecondsByAgency($agency);

                if ($current + $durationSeconds > $maxHours * self::SECONDS_PER_HOUR) {
                    throw new VideoHoursLimitReachedException();
                }
            }
        }

        $maxGb = $planConfig !== null ? $planConfig->getMaxStorageGb() : 0;

        if ($maxGb !== null) {
            $current = $this->reviewVersionRepository->sumStorageBytesByAgency($agency);

            if ($current + $fileSizeBytes > $maxGb * self::BYTES_PER_GB) {
                throw new StorageLimitReachedException();
            }
        }

        return new ReviewUploadMetricsDTO($fileSizeBytes, $durationSeconds);
    }

    public function computeUsage(Agency $agency): AgencyUsageResponseDTO
    {
        $planConfig = $this->getPlanConfig($agency);

        $editorCollaboratorsLimit = $planConfig !== null ? $planConfig->getMaxEditorCollaborators() : 0;
        $videoHoursLimit = $planConfig !== null ? $planConfig->getMaxVideoUploadHours() : 0;
        $storageGbLimit = $planConfig !== null ? $planConfig->getMaxStorageGb() : 0;

        return new AgencyUsageResponseDTO(
            editorCollaboratorsUsed: $this->userRepository->countActiveEditorsByAgency($agency)
                + $this->invitationRepository->countPendingEditorInvitationsByAgency($agency),
            editorCollaboratorsLimit: $editorCollaboratorsLimit,
            videoSecondsUsed: $this->reviewVersionRepository->sumVideoSecondsByAgency($agency),
            videoSecondsLimit: $videoHoursLimit !== null ? $videoHoursLimit * self::SECONDS_PER_HOUR : null,
            storageBytesUsed: $this->reviewVersionRepository->sumStorageBytesByAgency($agency),
            storageBytesLimit: $storageGbLimit !== null ? $storageGbLimit * self::BYTES_PER_GB : null,
        );
    }

    private function getPlanConfig(Agency $agency): ?PlanConfigResponseDTO
    {
        $plan = $this->subscriptionRepository->getLatestActiveByAgency($agency)?->getPlan();

        if ($plan === null) {
            return null;
        }

        return $this->stripePlanService->getPlanConfigFromSubscription($plan);
    }
}
