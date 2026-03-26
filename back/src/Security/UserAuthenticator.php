<?php

namespace App\Security;

use App\DTO\Response\Error\ErrorResponseDTO;
use App\DTO\Response\User\LoginResponseDTO;
use App\Entity\Enum\OtpType;
use App\Entity\User;
use App\Exception\Auth\InvalidCredentialsException;
use App\Exception\Auth\MissingCredentialsException;
use App\Service\Otp\OtpService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class UserAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly OtpService $otpService,
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'api_login';
    }

    public function authenticate(Request $request): Passport
    {
        $body = json_decode($request->getContent(), true);

        if (null === $body) {
            throw new MissingCredentialsException();
        }

        $email = $body['email'];
        $password = $body['password'];

        return new Passport(new UserBadge($email), new PasswordCredentials($password));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $tokenInterface, string $firewallName): ?Response
    {
        /** @var User $user */
        $user = $tokenInterface->getUser();

        if (!$user->isVerified()) {
            $otp = $this->otpService->createAndSend($user, OtpType::EmailVerification);
            $responseDto = new LoginResponseDTO(false, true, $otp->getPendingOtpToken(), $user->getEmail());

            return new JsonResponse(
                $responseDto->getData(),
                Response::HTTP_OK,
            );
        }

        $otp = $this->otpService->createAndSend($user, OtpType::Login);

        $responseDto = new LoginResponseDTO(true, false, $otp->getPendingOtpToken());

        return new JsonResponse(
            $responseDto->getData(),
            Response::HTTP_OK,
        );
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $appException = new InvalidCredentialsException();
        $responseDto = ErrorResponseDTO::fromAppException($appException);

        return new JsonResponse($responseDto->getData(), $appException->getHttpStatus());
    }
}
