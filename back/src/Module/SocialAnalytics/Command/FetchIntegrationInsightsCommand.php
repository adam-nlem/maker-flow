<?php

namespace App\Module\SocialAnalytics\Command;

use App\Entity\Enum\IntegrationProvider;
use App\Module\SocialAnalytics\Message\FetchIntegrationInsightsMessage;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsCommand(
    name: 'app:social-analytics:fetch-integration-insights',
    description: 'Fetches integration insights for all integrations',
)]
class FetchIntegrationInsightsCommand extends Command
{
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

        $instagramIntegrations = $this->integrationRepository->getByProvider(IntegrationProvider::Instagram);

        $io->info(sprintf('Found %d Instagram integrations', count($instagramIntegrations)));

        foreach ($instagramIntegrations as $integration) {
            $this->bus->dispatch(new FetchIntegrationInsightsMessage($integration->getId()));
        }

        $io->success('Integration insights fetch completed');

        return Command::SUCCESS;
    }
}
