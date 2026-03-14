<?php

namespace App\Controller;

use App\DTO\QueryParam\Credit\ListCreditTransactionsQueryParamDTO;
use App\DTO\Response\Credit\CreateRefillCheckoutResponseDTO;
use App\Entity\User;
use App\Repository\CreditTransactionRepository;
use App\Service\Credit\CreditService;
use App\Service\Stripe\Exception\CheckoutSessionCreationException;
use App\Service\Stripe\StripeCheckoutService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/credits')]
final class CreditController extends AbstractController
{
    #[Route('/refill/checkout', name: 'api_credits_refill_checkout', methods: ['POST'])]
    public function refillCheckout(StripeCheckoutService $stripeCheckoutService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            $checkoutUrl = $stripeCheckoutService->createRefillCheckoutSession($user);
        } catch (CheckoutSessionCreationException $e) {
            return $this->json(data: ["message" => $e->getMessage()], status: Response::HTTP_BAD_REQUEST);
        }

        $responseDto = new CreateRefillCheckoutResponseDTO($checkoutUrl);

        return $this->json(data: $responseDto->getData(), status: Response::HTTP_OK);
    }

    #[Route('/balance', name: 'api_credits_balance', methods: ['GET'])]
    public function balance(CreditService $creditService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $balance = $creditService->getOrCreateBalance($user);

        return $this->json(data: $balance, status: Response::HTTP_OK, context: ['groups' => ['api_credit_balance_show']]);
    }

    #[Route('/transactions', name: 'api_credits_transactions', methods: ['GET'])]
    public function transactions(ListCreditTransactionsQueryParamDTO $queryParamDto, CreditTransactionRepository $creditTransactionRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $transactions = $creditTransactionRepository->getByUserPaginated($user, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(data: $transactions, status: Response::HTTP_OK, context: ['groups' => ['api_credit_transactions_list']]);
    }
}
