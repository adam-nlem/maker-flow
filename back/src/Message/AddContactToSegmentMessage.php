<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class AddContactToSegmentMessage
{
    public function __construct(
        private readonly string $segmentName,
        private readonly string $email,
        private readonly ?string $firstName = null,
    ) {}

    public function getSegmentName(): string
    {
        return $this->segmentName;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }
}
