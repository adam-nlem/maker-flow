<?php

namespace App\Service\Mailing\Template;

use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

abstract class AbstractEmailTemplate
{
    protected Address $to;

    public function __construct(
        string $recipientEmail,
        string $recipientName,
    ) {
        $this->to = new Address($recipientEmail, $recipientName);
    }

    abstract protected function getSubject(): string;

    abstract protected function getHtmlBody(): string;

    public function toEmail(): Email
    {
        return (new Email())
            ->to($this->to)
            ->subject($this->getSubject())
            ->html($this->getHtmlBody());
    }
}
