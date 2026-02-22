<?php

namespace App\Command;

use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Helper\DateHelper;
use App\Message\FetchIntegrationInsightsMessage;
use App\Repository\IntegrationRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsCommand(
    name: 'app:social-analytics:fetch-integration-insights',
    description: 'Fetches integration insights for integrations not synced in the last 24 hours',
)]
class FetchIntegrationInsightsCommand extends Command
{
    private const SUPPORTED_PLATFORMS = [
        Platform::Instagram,
        Platform::Youtube,
    ];

    //TODO: Change this back to 24 horus
    private const SYNC_THRESHOLD_HOURS = 0;

    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly MessageBusInterface $bus,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Fetching integration insights');

        $since = DateHelper::createUtcDateTimeImmutable()
            ->modify('-' . self::SYNC_THRESHOLD_HOURS . ' hours');

        $integrations = $this->integrationRepository->getByPlatformsNotSyncedSinceAndStatus(
            self::SUPPORTED_PLATFORMS,
            $since,
            IntegrationStatus::Active
        );

        $io->info(sprintf('Found %d integrations needing sync (last synced > %d hours ago)', count($integrations), self::SYNC_THRESHOLD_HOURS));

        foreach ($integrations as $integration) {
            $io->text(sprintf(
                '  - Dispatching: %s (%s)',
                $integration->getUserName(),
                $integration->getPlatform()->value
            ));
            $this->bus->dispatch(new FetchIntegrationInsightsMessage($integration->getId()));
        }

        $io->success('Integration insights fetch messages dispatched');

        return Command::SUCCESS;
    }
}
