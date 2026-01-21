<?php

namespace App\Module\SocialAnalytics\Command;

use App\Entity\Enum\IntegrationProvider;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:social-analytics:fetch-post-insights',
    description: 'Fetches post insights for all integrations',
)]
class FetchPostInsightsCommand extends Command
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsPostInsightService $postInsightService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Fetching post insights');

        $instagramIntegrations = $this->integrationRepository->getByProvider(IntegrationProvider::Instagram);

        $io->info(sprintf('Found %d Instagram integrations', count($instagramIntegrations)));

        foreach ($instagramIntegrations as $integration) {
            try {
                $io->text(sprintf('Processing integration: %s', $integration->getAccountName()));
                $this->postInsightService->fetchInstagramPostInsights($integration);
                $io->text('✓ Done');
            } catch (\Exception $e) {
                $io->error(sprintf('Error processing integration %s: %s', $integration->getAccountName(), $e->getMessage()));
            }
        }

        $io->success('Post insights fetch completed');

        return Command::SUCCESS;
    }
}
