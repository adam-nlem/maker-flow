<?php

namespace App\Command;

use App\Service\Stripe\StripePlanService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:stripe:refresh-plans',
    description: 'Refresh Stripe plans cache from Stripe product/price metadata',
)]
class RefreshStripePlansCommand extends Command
{
    public function __construct(
        private readonly StripePlanService $stripePlanService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $plans = $this->stripePlanService->refreshCache();

        $io->success(sprintf('Successfully cached %d plans from Stripe.', count($plans)));

        foreach ($plans as $plan) {
            $io->writeln(sprintf(
                '  - %s (%s): %s %s/month, %d credits',
                $plan->getName(),
                $plan->getPlan(),
                $plan->getMonthlyPrice(),
                strtoupper($plan->getCurrency()),
                $plan->getCreditsPerMonth(),
            ));
        }

        return Command::SUCCESS;
    }
}
