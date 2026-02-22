<?php

namespace App\Command;

use App\Entity\Enum\IntegrationPlatform;
use App\Entity\Enum\IntegrationStatus;
use App\Message\FetchPostInsightsMessage;
use App\Service\PostInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsCommand(
    name: 'app:social-analytics:fetch-post-insights',
    description: 'Fetches post insights for all integrations',
)]
class FetchPostInsightsCommand extends Command
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

        $io->title('Fetching post insights');

        $instagramIntegrations = $this->integrationRepository->getByPlatformAndStatus(IntegrationPlatform::Instagram, IntegrationStatus::Active);
        $io->info(sprintf('Found %d active Instagram integrations', count($instagramIntegrations)));

        foreach ($instagramIntegrations as $integration) {
            $this->bus->dispatch(new FetchPostInsightsMessage($integration->getId()));
        }

        $youtubeIntegrations = $this->integrationRepository->getByPlatformAndStatus(IntegrationPlatform::Youtube, IntegrationStatus::Active);
        $io->info(sprintf('Found %d active YouTube integrations', count($youtubeIntegrations)));

        foreach ($youtubeIntegrations as $integration) {
            $this->bus->dispatch(new FetchPostInsightsMessage($integration->getId()));
        }

        $io->success('Post insights fetch messages dispatched');

        return Command::SUCCESS;
    }
}
