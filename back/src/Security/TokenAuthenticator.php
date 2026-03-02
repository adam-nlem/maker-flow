<?php

namespace App\Security;

use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Service\Cookie\CookieService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class TokenAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly TokenRepository   $tokenRepository,
        private readonly UserRepository $userRepository,
        private readonly CookieService $cookieService,
    ) {}

    public function supports(Request $request): ?bool
    {
        $path = $request->getPathInfo();
        $route = $request->attributes->get('_route');

        // Skip login and explicitly public endpoints
        // access_control decides authorization, not whether authenticators run
        //TODO: Check if this is the best way to do it
        if (
            $route === 'api_login'
            || str_starts_with($path, '/api/users/register')
            || $route === 'api_integrations_callback'
            || $route === 'api_stripe_webhook'
        ) {
            return false;
        }

        // Only handle API routes; for protected endpoints we want to run even if the cookie is missing
        return str_starts_with($path, '/api/');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $this->cookieService->getApiToken($request);

        if (null == $token) {
            throw new HttpException(Response::HTTP_UNAUTHORIZED, "No token found with this value");
        }

        if ($token->isExpired()) {
            throw new HttpException(Response::HTTP_UNAUTHORIZED, "Token expired, use email and password instead");
        }

        return new SelfValidatingPassport(new UserBadge($token->getValue(), function ($tokenValue) {

            // Here we can't access the user if we set it before the return statement (scope problems)
            $user = $this->tokenRepository->getByValue($tokenValue)->getUser();

            if (null === $user) {
                throw new HttpException(Response::HTTP_UNAUTHORIZED, "No user for this token");
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

        // $res = new JsonResponse();
        // $this->cookieService->addCookieToHeaders($token, $request, $res);
        // return $res;

        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(strtr($exception->getMessageKey(), $exception->getMessageData()), Response::HTTP_UNAUTHORIZED);
    }
}
