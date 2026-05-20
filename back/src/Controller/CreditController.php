<?php

namespace App\Controller;

use App\DTO\QueryParam\Credit\ListCreditTransactionsQueryParamDTO;
use App\DTO\Response\Credit\CreateRefillCheckoutResponseDTO;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Repository\AgencyRepository;
use App\Repository\CreditTransactionRepository;
use App\Service\Credit\CreditService;
use App\Service\Stripe\StripeCheckoutService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/credits')]
final class CreditController extends AbstractController
{
    #[Route('/refill/checkout', name: 'api_credits_refill_checkout', methods: ['POST'])]
    #[IsGranted(UserRole::Admin->value)]
    public function refillCheckout(
        AgencyRepository $agencyRepository,
        StripeCheckoutService $stripeCheckoutService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $checkoutUrl = $stripeCheckoutService->createRefillCheckoutSession($agency);

        $responseDto = new CreateRefillCheckoutResponseDTO($checkoutUrl);

        return $this->json(data: $responseDto->getData(), status: Response::HTTP_OK);
    }

    #[Route('/balance', name: 'api_credits_balance', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function balance(
        AgencyRepository $agencyRepository,
        CreditService $creditService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $balance = $creditService->getOrCreateBalance($agency);

        return $this->json(data: $balance, status: Response::HTTP_OK, context: ['groups' => ['api_credits_balance_show']]);
    }

    #[Route('/transactions', name: 'api_credits_transactions', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function transactions(
        ListCreditTransactionsQueryParamDTO $queryParamDto,
        AgencyRepository $agencyRepository,
        CreditTransactionRepository $creditTransactionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $transactions = $creditTransactionRepository->getByAgencyPaginated($agency, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(data: $transactions, status: Response::HTTP_OK, context: ['groups' => ['api_credits_transactions_list']]);
    }
}
