<?php

namespace App\Service\Mailing;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

final class MailingService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly string $fromAddress,
        private readonly string $fromName,
    ) {}

    /**
     * Send an email. The "from" address is set automatically from configuration
     * if not already defined on the Email object.
     *
     * When Messenger routing is configured for SendEmailMessage,
     * this call dispatches the email asynchronously via RabbitMQ.
     */
    public function send(Email $email): void
    {
        if (count($email->getFrom()) === 0) {
            $email->from(new Address($this->fromAddress, $this->fromName));
        }

        $this->mailer->send($email);
    }
}
