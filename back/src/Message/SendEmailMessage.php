<?php

namespace App\Message;

use App\Service\Mailing\Template\AbstractEmailTemplate;
use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class SendEmailMessage
{
    public function __construct(
        private readonly AbstractEmailTemplate $template,
    ) {}

    public function getTemplate(): AbstractEmailTemplate
    {
        return $this->template;
    }
}
