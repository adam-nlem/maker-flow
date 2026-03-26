<?php

namespace App\EventSubscriber;

use App\DTO\Response\Error\ErrorResponseDTO;
use App\Exception\AppException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::EXCEPTION)]
final class ApiExceptionSubscriber
{
    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        if (!$exception instanceof AppException) {
            return;
        }

        $responseDto =  ErrorResponseDTO::fromAppException(
            $exception
        );

        $event->setResponse(
            new JsonResponse(
                $responseDto->getData(),
                $exception->getHttpStatus()
            )
        );
    }
}
