<?php

namespace App\Sentry;

use App\DTO\Request\Exception\CustomValidationException;
use Sentry\Event;
use Sentry\EventHint;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

final class SentryBeforeSendCallback
{
    public function __invoke(Event $event, ?EventHint $hint): ?Event
    {
        $exception = $hint?->exception;

        if ($exception === null) {
            return $event;
        }

        if ($exception instanceof CustomValidationException) {
            return null;
        }

        if ($exception instanceof HttpExceptionInterface) {
            $statusCode = $exception->getStatusCode();
            if ($statusCode >= 400 && $statusCode < 500) {
                return null;
            }
        }

        return $event;
    }
}
