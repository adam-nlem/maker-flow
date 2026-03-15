<?php

namespace App\Message\Handler;

use App\Message\AddContactToSegmentMessage;
use App\Service\Mailing\MailingService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use function Sentry\captureException;

#[AsMessageHandler]
class AddContactToSegmentHandler
{
    public function __construct(
        private readonly MailingService $mailingService,
    ) {}

    public function __invoke(AddContactToSegmentMessage $message): void
    {
        try {
            $segmentId = $this->mailingService->findOrCreateSegment($message->getSegmentName());
            $this->mailingService->addContactToSegment($segmentId, $message->getEmail(), $message->getFirstName());
        } catch (\Throwable $e) {
            captureException($e);
        }
    }
}
