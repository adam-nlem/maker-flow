<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

// This class is used to do some action when the user is not authenticated
class AuthenticationEntryPoint implements AuthenticationEntryPointInterface
{

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new JsonResponse("You need to be authenticated to access this ressource", Response::HTTP_UNAUTHORIZED);
    }
}
