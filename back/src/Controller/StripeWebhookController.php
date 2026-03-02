<?php

namespace App\Controller;

use App\Entity\Enum\StripeEventType;
use App\Entity\StripeWebhookEvent;
use App\Message\ProcessStripeWebhookMessage;
use App\Repository\StripeWebhookEventRepository;
use App\Service\Stripe\Exception\WebhookSignatureVerificationException;
use App\Service\Stripe\StripeWebhookService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stripe')]
final class StripeWebhookController extends AbstractController
{
    #[Route('/webhook', name: 'api_stripe_webhook', methods: ['POST'])]
    public function webhook(
        Request $request,
        StripeWebhookService $stripeWebhookService,
        StripeWebhookEventRepository $webhookEventRepository,
        MessageBusInterface $messageBus,
    ): JsonResponse {
        $payload = $request->getContent();
        $signature = $request->headers->get('stripe-signature');

        if ($signature === null) {
            return $this->json(data: ['message' => 'Missing Stripe-Signature header'], status: Response::HTTP_BAD_REQUEST);
        }

        try {
            $event = $stripeWebhookService->constructEvent($payload, $signature);
        } catch (WebhookSignatureVerificationException $e) {
            return $this->json(data: ['message' => 'Invalid signature'], status: Response::HTTP_BAD_REQUEST);
        }

        $eventType = StripeEventType::tryFrom($event->type);

        if ($eventType === null) {
            return $this->json(data: ['message' => 'Event type not supported'], status: Response::HTTP_OK);
        }

        if ($webhookEventRepository->existsByStripeEventId($event->id)) {
            return $this->json(data: ['message' => 'Event already processed'], status: Response::HTTP_OK);
        }

        $webhookEvent = new StripeWebhookEvent();
        $webhookEvent->setStripeEventId($event->id)
            ->setEventType($eventType)
            ->setPayload($event->toArray());

        $webhookEventRepository->save($webhookEvent, true);

        $messageBus->dispatch(new ProcessStripeWebhookMessage($webhookEvent->getId()));

        return $this->json(data: ['message' => 'Webhook received'], status: Response::HTTP_OK);
    }
}
