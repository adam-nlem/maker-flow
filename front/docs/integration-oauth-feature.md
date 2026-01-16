# Integration & OAuth Feature Documentation (Frontend)

## Overview

This document describes the frontend OAuth integration system used in MakerFlow for connecting external services (Instagram, etc.). It covers the popup flow, message listeners, hooks architecture, and guidelines for adding new integrations.

---

## Architecture

### Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component (e.g., Dashboard)                   │
│                                                                  │
│  const { authorize, isPending, integrationUuid, oauthError }    │
│      = useAuthorizeInstagram();                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    useAuthorizeInstagram                         │
│                                                                  │
│  - Calls API to get authorization URL                           │
│  - Uses useOAuthPopup for popup management                      │
│  - Combines mutation state with OAuth state                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       useOAuthPopup                              │
│                                                                  │
│  - Opens popup window with OAuth URL                            │
│  - Manages popup lifecycle (open/close detection)               │
│  - Uses useOAuthMessageListener for callback handling           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   useOAuthMessageListener                        │
│                                                                  │
│  - Listens for postMessage from popup                           │
│  - Validates origin and message type                            │
│  - Extracts integrationUuid or errorCode                        │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
front/app/
├── hooks/
│   ├── api/integrations/
│   │   └── useAuthorizeInstagram.ts    # API hook for Instagram OAuth
│   ├── useOAuthPopup.ts                # Utility hook for popup management
│   └── useOAuthMessageListener.ts      # Utility hook for message listening
├── models/
│   ├── dtos/
│   │   └── OAuthCallbackReponseDTO.ts  # DTO for callback response
│   └── enums/
│       ├── IntegrationProvider.ts      # Provider enum (Instagram, etc.)
│       ├── OAuthCallbackStatus.ts      # Status enum (success, error)
│       ├── OAuthErrorCode.ts           # Error codes with translations
│       └── WindowMessageType.ts        # Message type enum
└── routes/
    └── integrations.callback.tsx       # Callback route (popup landing page)
```

---

## Complete OAuth Flow

### Sequence Diagram

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌───────────┐     ┌─────────┐
│Component │     │useAuthorize  │     │useOAuth │     │ Callback  │     │ Backend │
│          │     │Instagram     │     │Popup    │     │ Route     │     │         │
└────┬─────┘     └──────┬───────┘     └────┬────┘     └─────┬─────┘     └────┬────┘
     │                  │                  │                │                │
     │ 1. authorize()   │                  │                │                │
     │─────────────────>│                  │                │                │
     │                  │                  │                │                │
     │                  │ 2. GET /authorize│                │                │
     │                  │─────────────────────────────────────────────────────>
     │                  │                  │                │                │
     │                  │ 3. auth_url      │                │                │
     │                  │<─────────────────────────────────────────────────────
     │                  │                  │                │                │
     │                  │ 4. openPopup(url)│                │                │
     │                  │─────────────────>│                │                │
     │                  │                  │                │                │
     │                  │                  │ 5. window.open │                │
     │                  │                  │───────────────>│                │
     │                  │                  │                │                │
     │                  │                  │                │ 6. User auth   │
     │                  │                  │                │───────────────>│
     │                  │                  │                │                │
     │                  │                  │                │ 7. Redirect    │
     │                  │                  │                │<───────────────│
     │                  │                  │                │                │
     │                  │                  │ 8. postMessage │                │
     │                  │                  │<───────────────│                │
     │                  │                  │                │                │
     │                  │                  │ 9. window.close│                │
     │                  │                  │                │                │
     │                  │ 10. state update │                │                │
     │                  │<─────────────────│                │                │
     │                  │                  │                │                │
     │ 11. integrationUuid                 │                │                │
     │<─────────────────│                  │                │                │
     │                  │                  │                │                │
```

### Step-by-Step Flow

1. **User clicks "Connect Instagram"** - Component calls `authorize()`
2. **API request** - `useAuthorizeInstagram` calls `GET /api/integrations/instagram/authorize`
3. **Backend returns auth URL** - Instagram OAuth URL with state parameter
4. **Open popup** - `useOAuthPopup.openPopup(url)` opens centered popup window
5. **User authorizes** - User logs into Instagram and grants permissions
6. **Backend callback** - Instagram redirects to backend callback endpoint
7. **Backend processes** - Exchanges code for token, creates integration
8. **Frontend callback** - Backend redirects to `/integrations/callback?status=success&...`
9. **postMessage** - Callback route sends message to opener window
10. **Message received** - `useOAuthMessageListener` receives and validates message
11. **State update** - `integrationUuid` or `oauthError` state is set
12. **Component reacts** - Component renders success/error UI

---

## Hooks

### useAuthorizeInstagram

API hook that orchestrates the Instagram OAuth flow.

```typescript
// Location: hooks/api/integrations/useAuthorizeInstagram.ts

export function useAuthorizeInstagram() {
    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        provider: IntegrationProvider.Instagram,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.get<AuthorizeInstagramResponse>(
                '/integrations/instagram/authorize'
            );
            return res.data;
        },
        onSuccess: (data) => {
            openPopup(data.authorization_url);
        },
    });

    const reset = useCallback(() => {
        mutation.reset();
        resetOAuth();
    }, [mutation, resetOAuth]);

    return {
        authorize: mutation.mutate,
        isPending: mutation.isPending || isOpen,
        integrationUuid,
        oauthError: oauthError ?? (mutation.error ? OAuthErrorCode.TokenExchangeFailed : null),
        error: mutation.error,
        reset,
    };
}
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `authorize` | `() => void` | Starts the OAuth flow |
| `isPending` | `boolean` | True while API call or popup is active |
| `integrationUuid` | `string \| null` | UUID of created integration on success |
| `oauthError` | `OAuthErrorCode \| null` | Error code on failure |
| `error` | `Error \| null` | Raw mutation error |
| `reset` | `() => void` | Resets all state |

---

### useOAuthPopup

Utility hook that manages the OAuth popup window lifecycle.

```typescript
// Location: hooks/useOAuthPopup.ts

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_CHECK_INTERVAL_MS = 500;

/**
 * Utility hook to manage OAuth popup window and listen for callback messages
 */
export function useOAuthPopup({ provider }: UseOAuthPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popupError, setPopupError] = useState<OAuthErrorCode | null>(null);
    const popupRef = useRef<Window | null>(null);

    const {
        integrationUuid,
        oauthError: messageError,
        reset: resetMessageListener,
    } = useOAuthMessageListener({ provider });

    // Close popup when message received
    useEffect(() => {
        if (integrationUuid || messageError) {
            setIsOpen(false);
            popupRef.current = null;
        }
    }, [integrationUuid, messageError]);

    const openPopup = useCallback((url: string) => {
        // ... opens centered popup window
        // ... sets up interval to detect manual close
    }, [isOpen, provider, resetMessageListener]);

    return {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError: popupError ?? messageError,
        reset,
    };
}
```

**Features:**
- Opens centered popup window (600x700)
- Detects popup blocked by browser
- Detects manual popup close
- Combines popup errors with message listener errors

---

### useOAuthMessageListener

Utility hook that listens for postMessage from the OAuth callback popup.

```typescript
// Location: hooks/useOAuthMessageListener.ts

interface OAuthCallbackMessage {
    type: WindowMessageType.OAuthCallback;
    payload: OAuthCallbackReponseDTO;
}

export function useOAuthMessageListener({ provider }: UseOAuthMessageListenerProps) {
    const [integrationUuid, setIntegrationUuid] = useState<string | null>(null);
    const [oauthError, setOauthError] = useState<OAuthErrorCode | null>(null);

    const handleMessage = useCallback((event: MessageEvent<OAuthCallbackMessage>) => {
        // 1. Validate origin (security)
        if (event.origin !== window.location.origin) {
            return;
        }

        // 2. Validate message type
        if (event.data?.type !== WindowMessageType.OAuthCallback) {
            return;
        }

        // 3. Validate provider
        const { payload } = event.data;
        if (payload.provider !== provider) {
            return;
        }

        // 4. Handle success or error
        if (payload.status === OAuthCallbackStatus.Success && payload.integrationUuid) {
            setIntegrationUuid(payload.integrationUuid);
            setOauthError(null);
        } else if (payload.status === OAuthCallbackStatus.Error && payload.errorCode) {
            setOauthError(payload.errorCode);
            setIntegrationUuid(null);
        }
    }, [provider]);

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    return { integrationUuid, oauthError, reset };
}
```

**Security:**
- Validates `event.origin` matches current origin
- Validates message type using enum
- Filters by provider to support multiple integrations

---

## Callback Route

The callback route is the popup landing page after OAuth redirect.

```typescript
// Location: routes/integrations.callback.tsx

// After the Integration OAuth Connection, the API redirects to this URL
export default function IntegrationsCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Parse query params into DTO
        const payload = OAuthCallbackReponseDTO.fromSearchParams(searchParams);

        // Create message with typed enum
        const message = {
            type: WindowMessageType.OAuthCallback,
            payload,
        };

        // Send message to opener and close popup
        if (window.opener) {
            window.opener.postMessage(message, window.location.origin);
            window.close();
            return;
        }

        // Fallback: redirect to home if no opener (direct navigation)
        navigate("/");
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center">
            <p className="text-body-md text-secondary">Finalisation de la connexion...</p>
        </div>
    );
}
```

**Query Parameters (from backend):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | `success \| error` | OAuth result status |
| `provider` | `instagram` | Integration provider |
| `errorCode` | `string?` | Error code if status is error |
| `integrationUuid` | `string?` | Integration UUID if status is success |

---

## Enums

### IntegrationProvider

```typescript
// Location: models/enums/IntegrationProvider.ts

export enum IntegrationProvider {
    Instagram = "instagram",
    // Future: TikTok = "tiktok",
}
```

### OAuthCallbackStatus

```typescript
// Location: models/enums/OAuthCallbackStatus.ts

export enum OAuthCallbackStatus {
    Success = "success",
    Error = "error",
}
```

### OAuthErrorCode

```typescript
// Location: models/enums/OAuthErrorCode.ts

export enum OAuthErrorCode {
    InvalidState = "invalid_state",
    MissingCode = "missing_code",
    TokenExchangeFailed = "token_exchange_failed",
    UserNotFound = "user_not_found",
    ProviderError = "provider_error",
    PopupBlocked = "popup_blocked",
}

export const oAuthErrorCodeToFrenchTranslation: Record<OAuthErrorCode, string> = {
    [OAuthErrorCode.InvalidState]: "La session a expiré. Veuillez réessayer.",
    [OAuthErrorCode.MissingCode]: "Code d'autorisation manquant.",
    [OAuthErrorCode.TokenExchangeFailed]: "Échec de la connexion. Veuillez réessayer.",
    [OAuthErrorCode.UserNotFound]: "Utilisateur non trouvé.",
    [OAuthErrorCode.ProviderError]: "Erreur du fournisseur. Veuillez réessayer.",
    [OAuthErrorCode.PopupBlocked]: "Le popup a été bloqué. Veuillez autoriser les popups.",
};
```

### WindowMessageType

```typescript
// Location: models/enums/WindowMessageType.ts

export enum WindowMessageType {
    OAuthCallback = "oauth_callback",
}
```

---

## DTOs

### OAuthCallbackReponseDTO

```typescript
// Location: models/dtos/OAuthCallbackReponseDTO.ts

export class OAuthCallbackReponseDTO {
    constructor(
        public readonly status: OAuthCallbackStatus,
        public readonly provider: IntegrationProvider,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("provider") as IntegrationProvider,
            (params.get("errorCode") as OAuthErrorCode) ?? undefined,
            params.get("integrationUuid") ?? undefined,
        );
    }
}
```

---

## Component Usage

### Basic Usage

```tsx
export default function SocialAnalyticsDashboardView() {
    const { authorize, isPending, integrationUuid, oauthError, reset } = useAuthorizeInstagram();

    const handleConnectInstagram = () => {
        reset();
        authorize();
    };

    if (integrationUuid) {
        return (
            <div>
                <h2>Instagram Connected</h2>
                <p>Your Instagram account has been successfully connected.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Social Analytics</h2>
            {oauthError && (
                <p className="text-danger">{oAuthErrorCodeToFrenchTranslation[oauthError]}</p>
            )}
            <Button onClick={handleConnectInstagram} isLoading={isPending}>
                Connect Instagram
            </Button>
        </div>
    );
}
```

---

## Adding a New Integration

### 1. Add Provider Enum

```typescript
// models/enums/IntegrationProvider.ts
export enum IntegrationProvider {
    Instagram = "instagram",
    TikTok = "tiktok",  // Add new provider
}
```

### 2. Create API Hook

```typescript
// hooks/api/integrations/useAuthorizeTikTok.ts
export function useAuthorizeTikTok() {
    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        provider: IntegrationProvider.TikTok,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.get<AuthorizeTikTokResponse>(
                '/integrations/tiktok/authorize'
            );
            return res.data;
        },
        onSuccess: (data) => {
            openPopup(data.authorization_url);
        },
    });

    // ... same pattern as useAuthorizeInstagram
}
```

### 3. Checklist

- [ ] Add provider to `IntegrationProvider` enum
- [ ] Create `useAuthorize{Provider}` hook
- [ ] Ensure backend has matching endpoints
- [ ] Test full flow end-to-end
- [ ] Test error scenarios (popup blocked, user denies, etc.)

---

## Security Considerations

### Origin Validation

All postMessage handlers validate the origin:

```typescript
if (event.origin !== window.location.origin) {
    return;
}
```

### Message Type Validation

Messages are validated using typed enums:

```typescript
if (event.data?.type !== WindowMessageType.OAuthCallback) {
    return;
}
```

### Provider Filtering

Each listener only processes messages for its specific provider:

```typescript
if (payload.provider !== provider) {
    return;
}
```

---

## Error Handling

### Error Sources

| Source | Error | Handling |
|--------|-------|----------|
| API call | Network error | `mutation.error` |
| Popup | Blocked by browser | `OAuthErrorCode.PopupBlocked` |
| Backend | Invalid state | `OAuthErrorCode.InvalidState` |
| Backend | Token exchange failed | `OAuthErrorCode.TokenExchangeFailed` |
| Provider | User denied | `OAuthErrorCode.ProviderError` |

### Error Display

```tsx
{oauthError && (
    <p className="text-danger">
        {oAuthErrorCodeToFrenchTranslation[oauthError]}
    </p>
)}
```

---

## Testing Checklist

1. **Happy path** - Full authorization flow succeeds
2. **Popup blocked** - Error displayed, user can retry
3. **User denies** - Provider error handled
4. **User closes popup** - State resets correctly
5. **Direct navigation** - Callback route redirects to home
6. **Multiple providers** - Messages filtered correctly
