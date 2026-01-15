<?php

namespace App\Entity\Enum;

enum OAuthErrorCode: string
{
    case InvalidState = 'invalid_state';
    case MissingCode = 'missing_code';
    case UserNotFound = 'user_not_found';
    case TokenExchangeFailed = 'token_exchange_failed';
    case ProviderError = 'provider_error';
}
