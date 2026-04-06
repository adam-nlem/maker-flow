<?php

namespace App\Command;

use App\Repository\PostRepository;
use App\Service\PostGroup\PostGroupService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:post-group:auto-group',
    description: 'Re-runs auto-grouping on all ungrouped posts',
)]
class AutoGroupPostsCommand extends Command
{
    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly PostGroupService $postGroupService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Auto-grouping posts');

        $posts = $this->postRepository->getUngroupedPosts();

        $io->info(sprintf('Found %d ungrouped posts', count($posts)));

        $groupedCount = 0;

        foreach ($posts as $post) {
            $this->postGroupService->tryAutoGroup($post);

            if ($post->getPostGroup() !== null) {
                $groupedCount++;
                $io->text(sprintf(
                    '  - Grouped: %s (%s) -> group "%s"',
                    $post->getExternalId(),
                    $post->getIntegration()->getPlatform()->value,
                    $post->getPostGroup()->getTitle(),
                ));
            }
        }

        $io->success(sprintf('Auto-grouping complete: %d posts grouped out of %d scanned', $groupedCount, count($posts)));

        return Command::SUCCESS;
    }
}
