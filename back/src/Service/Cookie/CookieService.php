<?php

namespace App\Service\Cookie;

use App\Entity\Token;
use App\Helper\DateHelper;
use App\Helper\HeaderHelper;
use App\Repository\TokenRepository;
use DateTimeImmutable;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CookieService
{
    const API_TOKEN_COOKIE = 'X-API-TOKEN';

    public function __construct(
        private TokenRepository $tokenRepository,
        private string $appDomain,
    ) {}

    public function hasApiTokenCookie(Request $request): bool
    {
        return $request->cookies->has(self::API_TOKEN_COOKIE);
    }

    public function getApiToken(Request $request): ?Token
    {
        $tokenValue =  $request->cookies->get(self::API_TOKEN_COOKIE);

        if (!$tokenValue) return null;

        return $this->tokenRepository->getByValue($tokenValue);
    }

    public function addCookieToHeaders(Token $token, Request $request, Response $response)
    {
        $timezone = HeaderHelper::getTimezone($request);
        $cookie = new Cookie(
            self::API_TOKEN_COOKIE,
            $token->getValue(),
            new \DateTimeImmutable(DateHelper::convertToTZFromUTC($token->getExpiresAt(), $timezone)),
            '/',
            $this->appDomain,
            $request->getScheme() === 'https',
            true,
            false,
            Cookie::SAMESITE_STRICT
        );

        $response->headers->setCookie($cookie);
    }

    public function clearCookie(Request $request, Response $response)
    {
        $response->headers->clearCookie(
            self::API_TOKEN_COOKIE,
            '/',
            $this->appDomain,
            $request->getScheme() === 'https',
            true,
            Cookie::SAMESITE_STRICT
        );
    }
}
