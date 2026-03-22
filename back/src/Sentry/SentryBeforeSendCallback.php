<?php

namespace App\Sentry;

use App\Exception\AppException;
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

        if ($exception instanceof AppException) {
            if ($exception->getHttpStatus() >= 400 && $exception->getHttpStatus() < 500) {
                return null;
            }
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
