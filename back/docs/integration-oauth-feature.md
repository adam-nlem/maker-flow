# Integration & OAuth Feature Documentation

## Overview

This document describes the backend OAuth integration system used in MakerFlow for connecting external services (Instagram, etc.). It covers the flow, error handling, and guidelines for adding new integrations.

---

## OAuth Flow

### Instagram OAuth 2.0 Authorization Code Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Frontend    │     │     Backend     │     │    Instagram    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. Request auth URL   │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │ 2. Return auth URL    │                       │
         │   + store state       │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │ 3. Open popup         │                       │
         │───────────────────────────────────────────────>
         │                       │                       │
         │                       │ 4. User authorizes    │
         │                       │<──────────────────────│
         │                       │                       │
         │                       │ 5. Callback with code │
         │                       │<──────────────────────│
         │                       │                       │
         │                       │ 6. Exchange code      │
         │                       │──────────────────────>│
         │                       │                       │
         │                       │ 7. Return tokens      │
         │                       │<──────────────────────│
         │                       │                       │
         │ 8. Redirect to        │                       │
         │    frontend callback  │                       │
         │<──────────────────────│                       │
         │                       │                       │
```

### Backend Step-by-Step Flow

1. **Frontend requests auth URL** - `GET /api/integrations/instagram/authorize`
2. **Generate state** - Random token `bin2hex(random_bytes(16))`
3. **Store state in Redis** - Key: `INTEGRATION/INSTAGRAM/STATE/{state}`, Value: user UUID, TTL: 5 min
4. **Return Instagram OAuth URL** - With client_id, redirect_uri, scope, state
5. **Instagram redirects to callback** - `GET /api/integrations/instagram/callback?code=xxx&state=xxx`
6. **Validate state** - Check Redis for matching state, delete after use
7. **Exchange code for short-lived token** - POST to Instagram token endpoint
8. **Exchange for long-lived token** - GET to Instagram graph API
9. **Fetch user profile** - GET Instagram user_id, username
10. **Create/update Integration entity** - Store in database
11. **Redirect to frontend callback** - `/integrations/callback?status=success&provider=instagram&integrationUuid=xxx`

---

## Enums

### OAuthCallbackStatus

```php
// App\Entity\Enum\OAuthCallbackStatus
enum OAuthCallbackStatus: string
{
    case Success = 'success';
    case Error = 'error';
}
```

### OAuthErrorCode

```php
// App\Entity\Enum\OAuthErrorCode
enum OAuthErrorCode: string
{
    case InvalidState = 'invalid_state';
    case MissingCode = 'missing_code';
    case TokenExchangeFailed = 'token_exchange_failed';
    case UserNotFound = 'user_not_found';
    case ProviderError = 'provider_error';
}
```

### IntegrationProvider

```php
// App\Entity\Enum\IntegrationProvider
enum IntegrationProvider: string
{
    case Instagram = 'instagram';
    // Future: TikTok, YouTube, etc.
}
```

---

## External DTOs

External DTOs are used to type responses from third-party APIs. They are located in `DTO/External/{Provider}/`.

### InstagramTokenDTO

```php
<?php

namespace App\DTO\External\Instagram;

class InstagramTokenDTO
{
    public function __construct(
        private readonly string $accessToken,
        private readonly int $expiresIn,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            accessToken: $data['access_token'],
            expiresIn: $data['expires_in'] ?? 5184000,
        );
    }

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function getExpiresIn(): int
    {
        return $this->expiresIn;
    }
}
```

### InstagramUserProfileDTO

```php
<?php

namespace App\DTO\External\Instagram;

class InstagramUserProfileDTO
{
    public function __construct(
        private readonly string $userId,
        private readonly string $username,
        private readonly ?string $name,
        private readonly ?string $profilePictureUrl,
        private readonly ?string $accountType,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            userId: $data['user_id'],
            username: $data['username'],
            name: $data['name'] ?? null,
            profilePictureUrl: $data['profile_picture_url'] ?? null,
            accountType: $data['account_type'] ?? null,
        );
    }

    // Getters...
}
```

---

## Security Considerations

### CSRF Protection (State Parameter)

1. **Generate random state** - `bin2hex(random_bytes(16))`
2. **Store in Redis** - Key: `INTEGRATION/INSTAGRAM/STATE/{state}`, Value: user UUID
3. **Short TTL** - 5 minutes expiration
4. **Validate on callback** - Check state exists and matches
5. **Delete after use** - Prevent replay attacks

### Token Storage

- Access tokens stored in database
- Never exposed to frontend
- Refresh tokens handled server-side

---

## API Endpoints

### Authorization

```
GET /api/integrations/instagram/authorize
```

**Response:**
```json
{
    "authorization_url": "https://www.instagram.com/oauth/authorize?..."
}
```

### Callback (Internal)

```
GET /api/integrations/instagram/callback?code=xxx&state=xxx
```

Redirects to: `/integrations/callback?status=success&provider=instagram&integrationUuid=xxx`

### Token Refresh

```
POST /api/integrations/instagram/{integrationUuid}/refresh
```

### List Integrations

```
GET /api/integrations?page=1&limit=10
```

### Show Integration

```
GET /api/integrations/{integrationUuid}
```

### Delete Integration

```
DELETE /api/integrations/{integrationUuid}
```

---

## Adding a New Integration

### 1. Backend

#### Create Provider Enum Case

```php
// Entity/Enum/IntegrationProvider.php
enum IntegrationProvider: string
{
    case Instagram = 'instagram';
    case TikTok = 'tiktok';  // Add new provider
}
```

#### Create External DTOs

```
DTO/External/TikTok/
├── TikTokTokenDTO.php
└── TikTokUserProfileDTO.php
```

#### Create OAuth Service

```php
// Service/Integration/TikTokOAuthService.php
class TikTokOAuthService
{
    public function getAuthorizationUrl(string $state): string { }
    public function exchangeCodeForToken(string $code): TikTokTokenDTO { }
    public function getUserProfile(string $accessToken): TikTokUserProfileDTO { }
    public function createIntegration(User $user, TikTokTokenDTO $token, TikTokUserProfileDTO $profile): Integration { }
    public function updateIntegrationToken(Integration $integration, TikTokTokenDTO $token): Integration { }
    public function refreshToken(string $token): TikTokTokenDTO { }
}
```

#### Add Controller Routes

```php
#[Route('/tiktok/authorize', name: 'api_integrations_tiktok_authorize', methods: ['GET'])]
public function tiktokAuthorize(): JsonResponse { }

#[Route('/tiktok/callback', name: 'api_integrations_tiktok_callback', methods: ['GET'])]
public function tiktokCallback(): Response { }

#[Route('/tiktok/{integrationUuid}/refresh', name: 'api_integrations_tiktok_refresh', methods: ['POST'])]
public function tiktokRefresh(string $integrationUuid): JsonResponse { }
```

#### Add Redis State Key

```php
// Service/RedisStore/RedisStoreService.php
public static function getIntegrationTikTokStateKey(string $state): string
{
    return "INTEGRATION/TIKTOK/STATE/{$state}";
}
```

### 2. Environment Variables

```env
# .env
TIKTOK_APP_ID=xxx
TIKTOK_APP_SECRET=xxx
TIKTOK_REDIRECT_URI=https://api.yourapp.com/api/integrations/tiktok/callback
```

### 3. Checklist

- [ ] Add provider to `IntegrationProvider` enum
- [ ] Create External DTOs for API responses
- [ ] Create OAuth service with all methods
- [ ] Add controller routes (authorize, callback, refresh)
- [ ] Add Redis state key method
- [ ] Add environment variables
- [ ] Test full flow end-to-end

---

## Error Handling

### Error Flow

```php
try {
    $shortLivedToken = $this->instagramOAuthService->exchangeCodeForToken($code);
    // ...
} catch (\Exception $e) {
    return $this->redirectToFrontendCallback(
        OAuthCallbackStatus::Error,
        IntegrationProvider::Instagram,
        OAuthErrorCode::TokenExchangeFailed
    );
}
```

### Redirect to Frontend Callback

On error or success, the backend redirects to the frontend callback route with query parameters:

```php
private function redirectToFrontendCallback(
    OAuthCallbackStatus $status,
    IntegrationProvider $provider,
    ?OAuthErrorCode $errorCode = null,
    ?string $integrationUuid = null
): Response {
    $dto = new RedirectToFrontendCallbackResponseDTO($status, $provider, $errorCode, $integrationUuid);
    return $this->redirect(
        $this->frontendUrl . '/integrations/callback?' . http_build_query($dto->getData())
    );
}
```

---

## Testing

### Manual Testing Checklist

1. **Happy path** - Full authorization flow succeeds
2. **User denies** - Provider error handled
3. **State expired** - Invalid state error after 5 minutes
4. **Existing integration** - Token updated, not duplicated
5. **Token refresh** - Refresh endpoint works
6. **Delete integration** - Removed from database
