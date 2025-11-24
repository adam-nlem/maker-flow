<?php

namespace App\Security;

use App\DTO\Response\LoginResponseDTO;
use App\Entity\Token;
use App\Entity\User;
use App\Repository\TokenRepository;
use App\Service\Cookie\CookieService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Serializer\SerializerInterface;

class UserAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private TokenRepository $tokenRepository,
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
        private CookieService $cookieService,
    ) {}
    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'api_login';
    }

    public function authenticate(Request $request): Passport
    {
        $body = json_decode($request->getContent(), true);

        if (null === $body) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, "You have to provide an email and a password");
        }

        $email = $body['email'];
        $password = $body['password'];

        return new Passport(new UserBadge($email), new PasswordCredentials($password));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $tokenInterface, string $firewallName): ?Response
    {
        /** @var User $user */
        $user = $tokenInterface->getUser();

        $token = $this->tokenRepository->getByUser($user);

        if (null === $token) {
            $token = new Token();

            $user->addToken($token);
            $this->em->persist($token);
        } else {
            if ($token->isExpired()) {
                $token
                    ->resetToken();
            }
        }

        $this->em->flush();

        $jsonData = $this->serializer->serialize($user, 'json', ['groups' => ['api_login']]);

        $res = new JsonResponse($jsonData, Response::HTTP_OK, [], true);
        $this->cookieService->addCookieToHeaders($token, $request, $res);
        return $res;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse("Wrong email or password", Response::HTTP_UNAUTHORIZED);
    }
}
