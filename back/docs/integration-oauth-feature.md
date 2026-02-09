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

1. **Frontend requests integration creation** - `POST /api/integrations` with `userModuleUuid` and `provider`
2. **Validate userModule** - Check userModule exists and belongs to user
3. **Check existing integration** - Return error if userModule already has an integration for this provider
4. **Generate state** - Random token `bin2hex(random_bytes(16))`
5. **Store state in Redis** - Key: `INTEGRATION/STATE/{state}`, Value: JSON with userUuid, userModuleUuid, provider, TTL: 5 min
6. **Return OAuth URL** - Provider-specific authorization URL with state
7. **Provider redirects to callback** - `GET /api/integrations/callback?code=xxx&state=xxx`
8. **Validate state** - Check Redis for matching state, extract userModuleUuid and provider, delete after use
9. **Exchange code for tokens** - Provider-specific token exchange
10. **Fetch user profile** - Provider-specific profile fetch
11. **Create/update Integration entity** - Store in database
12. **Link integration to userModule** - Add integration to userModule's integrations collection
13. **Redirect to frontend callback** - `/integrations/callback?status=success&provider={provider}&integrationUuid=xxx`

### Business Rules

- **One integration per provider per userModule** - A userModule can only have one integration for each provider (e.g., one Instagram account per Social Analytics widget)
- **Same integration can be linked to multiple userModules** - The same Instagram account can be used in different projects

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
    case Github = 'github';
    case Youtube = 'youtube';
    case Instagram = 'instagram';
}
```

---

## Integration Entity

The `Integration` entity stores connected external accounts and their OAuth tokens.

### Properties

| Property | Type | Nullable | Description |
|----------|------|----------|-------------|
| `uuid` | `GUID` | No | Unique identifier |
| `provider` | `IntegrationProvider` | No | Provider enum (Instagram, etc.) |
| `accessToken` | `string` | No | OAuth access token |
| `refreshToken` | `string` | Yes | OAuth refresh token (if available) |
| `scope` | `array` | Yes | Granted OAuth scopes |
| `accountId` | `string` | No | Provider's user ID |
| `userName` | `string` | No | Provider's username (e.g., @johndoe) |
| `name` | `string` | Yes | User's display name |
| `profilePictureUrl` | `text` | Yes | Profile picture URL |
| `createdAt` | `DateTimeImmutable` | No | Creation timestamp |
| `updatedAt` | `DateTimeImmutable` | Yes | Last update timestamp |
| `expiresAt` | `DateTimeImmutable` | Yes | Token expiration timestamp |
| `refreshTokenExpiresAt` | `DateTimeImmutable` | Yes | Refresh token expiration (YouTube) |
| `lastSyncedAt` | `DateTimeImmutable` | No | Last data sync timestamp |
| `user` | `User` | No | Owner of the integration |
| `status` | `IntegrationStatus` | No | Active, Expired, Revoked |

### Relationships

- **User** - `ManyToOne` - Each integration belongs to one user
- **UserModules** - `ManyToMany` - Integration can be linked to multiple user modules

### Usage in SocialAnalytics Module

The `Integration` entity acts as a profile entity. Related entities now reference `Integration` directly:

- `SocialAnalyticsPost` → `ManyToOne` → `Integration`
- `SocialAnalyticsInsights` → `ManyToOne` → `Integration`

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

### YoutubeTokenDTO

```php
<?php

namespace App\DTO\External\Youtube;

class YoutubeTokenDTO
{
    public function __construct(
        private readonly string $accessToken,
        private readonly int $expiresIn,
        private readonly ?string $refreshToken,
        private readonly string $scope,
        private readonly ?int $refreshTokenExpiresIn,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            accessToken: $data['access_token'],
            expiresIn: $data['expires_in'],
            refreshToken: $data['refresh_token'] ?? null,
            scope: $data['scope'],
            refreshTokenExpiresIn: $data['refresh_token_expires_in'] ?? null,
        );
    }

    // Getters...
}
```

### YoutubeChannelDTO

```php
<?php

namespace App\DTO\External\Youtube;

use Google\Service\YouTube\Channel;

class YoutubeChannelDTO
{
    public function __construct(
        private readonly string $channelId,
        private readonly string $title,
        private readonly ?string $customUrl,
        private readonly ?string $thumbnailUrl,
    ) {}

    public static function fromGoogleChannel(Channel $channel): self
    {
        $snippet = $channel->getSnippet();
        $thumbnails = $snippet?->getThumbnails();
        $defaultThumbnail = $thumbnails?->getDefault();

        return new self(
            channelId: $channel->getId(),
            title: $snippet?->getTitle() ?? '',
            customUrl: $snippet?->getCustomUrl(),
            thumbnailUrl: $defaultThumbnail?->getUrl(),
        );
    }

    // Getters...
}
```

---

## Security Considerations

### CSRF Protection (State Parameter)

1. **Generate random state** - `bin2hex(random_bytes(16))`
2. **Store in Redis** - Key: `INTEGRATION/STATE/{state}`, Value: `IntegrationStateRedisDTO` JSON
3. **Short TTL** - 5 minutes expiration
4. **Validate on callback** - Check state exists and matches
5. **Delete after use** - Prevent replay attacks

### Redis State DTO

```php
// DTO/Redis/Integration/IntegrationStateRedisDTO.php
class IntegrationStateRedisDTO
{
    public function __construct(
        private readonly string $userUuid,
        private readonly string $userModuleUuid,
        private readonly IntegrationProvider $provider,
    ) {}

    public static function fromJson(string $json): self { }
    public function toJson(): string { }
    // Getters...
}
```

### Token Storage

- Access tokens stored in database
- Never exposed to frontend
- Refresh tokens handled server-side

---

## API Endpoints

### Create Integration

```
POST /api/integrations
```

**Request Body:**
```json
{
    "userModuleUuid": "uuid-of-user-module",
    "provider": "instagram"
}
```

**Response:**
```json
{
    "authorization_url": "https://www.instagram.com/oauth/authorize?..."
}
```

**Error Response (409 Conflict):**
```json
{
    "message": "This user module already has an integration for this provider"
}
```

### Callback (Internal)

```
GET /api/integrations/callback?code=xxx&state=xxx
```

Redirects to: `/integrations/callback?status=success&provider={provider}&integrationUuid=xxx`

### List Integrations

```
GET /api/integrations?userModuleUuid=xxx
```

**Response:** Flat array of integrations (one per provider per userModule)

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

#### Add Provider Case to Controller

The generic `POST /api/integrations` route handles all providers. Add the new provider to the `match` statement:

```php
// In IntegrationController::create()
$authorizationUrl = match ($dto->getProvider()) {
    IntegrationProvider::Instagram => $this->instagramOAuthService->getAuthorizationUrl($state),
    IntegrationProvider::TikTok => $this->tiktokOAuthService->getAuthorizationUrl($state),
};

// In IntegrationController::callback()
$integration = match ($provider) {
    IntegrationProvider::Instagram => $this->instagramOAuthService->handleCallback($code, $user, $userModule),
    IntegrationProvider::TikTok => $this->tiktokOAuthService->handleCallback($code, $user, $userModule),
};
```

#### Create Redis State Model (if not exists)

The generic `IntegrationStateRedisDTO` is already used for all providers:

```php
// DTO/Redis/Integration/IntegrationStateRedisDTO.php
// Already handles all providers via the provider property
```

### 2. Environment Variables

```env
# .env
TIKTOK_APP_ID=xxx
TIKTOK_APP_SECRET=xxx
TIKTOK_REDIRECT_URI=https://api.yourapp.com/api/integrations/callback
```

### 3. Checklist

- [ ] Add provider to `IntegrationProvider` enum
- [ ] Create External DTOs for API responses
- [ ] Create OAuth service with `handleCallback`, `getAuthorizationUrl`, and token methods
- [ ] Add provider case to `IntegrationController::create()` match statement
- [ ] Add provider case to `IntegrationController::callback()` match statement
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
    $dto = new OAuthCallbackResponseDTO($status, $provider, $errorCode, $integrationUuid);
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
