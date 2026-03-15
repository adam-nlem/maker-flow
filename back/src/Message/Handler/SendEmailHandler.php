<?php

namespace App\Message\Handler;

use App\Message\SendEmailMessage;
use App\Service\Mailing\MailingService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class SendEmailHandler
{
    public function __construct(
        private readonly MailingService $mailingService,
    ) {}

    public function __invoke(SendEmailMessage $message): void
    {
        $this->mailingService->send($message->getTemplate()->toEmail());
    }
}
