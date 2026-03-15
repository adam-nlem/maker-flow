<?php

namespace App\Service\Mailing;

use Resend\Client;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

final class MailingService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly Client $resend,
        private readonly string $fromAddress,
        private readonly string $fromName,
    ) {}

    public function send(Email $email): void
    {
        if (count($email->getFrom()) === 0) {
            $email->from(new Address($this->fromAddress, $this->fromName));
        }

        $this->mailer->send($email);
    }

    public function findOrCreateSegment(string $name): string
    {
        $segments = $this->resend->segments->list();

        foreach ($segments['data'] as $segment) {
            if ($segment['name'] === $name) {
                return $segment['id'];
            }
        }

        $created = $this->resend->segments->create(['name' => $name]);

        return $created['id'];
    }

    public function addContactToSegment(string $segmentId, string $email, ?string $firstName = null): void
    {
        $params = ['email' => $email];

        if ($firstName !== null) {
            $params['first_name'] = $firstName;
        }

        $this->resend->contacts->create($params);

        $this->resend->contacts->segments->add(
            contact: $email,
            segmentId: $segmentId,
        );
    }
}
