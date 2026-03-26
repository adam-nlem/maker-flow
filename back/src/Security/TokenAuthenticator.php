<?php

namespace App\Security;

use App\DTO\Response\Error\ErrorResponseDTO;
use App\Exception\Auth\EmailNotVerifiedException;
use App\Exception\Auth\InvalidTokenException;
use App\Exception\Auth\MissingTokenException;
use App\Exception\Auth\TokenExpiredException;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Service\Cookie\CookieService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class TokenAuthenticator extends AbstractAuthenticator
{
    private const EXCLUDED_ROUTES = [
        'api_login',
        'api_user_register',
        'api_integrations_callback',
        'api_stripe_webhook',
        'api_otp_verify_login',
        'api_otp_verify_email',
        'api_otp_resend',
        'api_prelaunch_authenticate',
        'api_otp_verify_prelaunch',
    ];

    public function __construct(
        private readonly TokenRepository $tokenRepository,
        private readonly UserRepository $userRepository,
        private readonly CookieService $cookieService,
    ) {}

    public function supports(Request $request): ?bool
    {
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return false;
        }

        return !in_array($request->attributes->get('_route'), self::EXCLUDED_ROUTES, true);
    }

    public function authenticate(Request $request): Passport
    {
        $token = $this->cookieService->getApiToken($request);

        if (null == $token) {
            throw new MissingTokenException();
        }

        if ($token->isExpired()) {
            throw new TokenExpiredException();
        }

        return new SelfValidatingPassport(new UserBadge($token->getValue(), function ($tokenValue) {

            // Here we can't access the user if we set it before the return statement (scope problems)
            $user = $this->tokenRepository->getByValue($tokenValue)->getUser();

            if (null === $user) {
                throw new InvalidTokenException();
            }

            if (!$user->isVerified()) {
                throw new EmailNotVerifiedException();
            }

            return $user;
        }));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $token = $this->cookieService->getApiToken($request);
        if ($token) {
            $now = new \DateTime();
            $oneDayFromNow = (clone $now)->modify('+1 day');
            if ($token->getExpiresAt() <= $oneDayFromNow) {
                $token->resetExpiresAt();
                $this->tokenRepository->save($token, true);
            }
        }

        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $appException = new InvalidTokenException();
        $responseDto = ErrorResponseDTO::fromAppException($appException);

        return new JsonResponse($responseDto->getData(), $appException->getHttpStatus());
    }
}
