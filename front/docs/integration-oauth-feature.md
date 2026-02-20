# Integration & OAuth Feature Documentation (Frontend)

## Overview

This document describes the frontend OAuth integration system used in MakerFlow for connecting external services (Instagram, etc.). It covers the popup flow, message listeners, hooks architecture, and guidelines for adding new integrations.

---

## Architecture

### Component Hierarchy

```
+------------------------------------------------------------------+
|                    Component (e.g., Dashboard)                    |
|                                                                   |
|  const { createIntegration, isPending, integrationUuid, ... }    |
|      = useCreateIntegration({ projectUuid, provider });           |
+----------------------------+-------------------------------------+
                             |
                             v
+------------------------------------------------------------------+
|                    useCreateIntegration                            |
|                                                                   |
|  - Calls POST /api/integrations with projectUuid & provider      |
|  - Uses useOAuthPopup for popup management                       |
|  - Combines mutation state with OAuth state                      |
|  - Invalidates integrations query on success                     |
+----------------------------+-------------------------------------+
                             |
                             v
+------------------------------------------------------------------+
|                       useOAuthPopup                               |
|                                                                   |
|  - Opens popup window with OAuth URL                             |
|  - Manages popup lifecycle (open/close detection)                |
|  - Uses useOAuthMessageListener for callback handling            |
|  - Calls onSuccess callback when integration is created          |
+----------------------------+-------------------------------------+
                             |
                             v
+------------------------------------------------------------------+
|                   useOAuthMessageListener                         |
|                                                                   |
|  - Listens for postMessage from popup                            |
|  - Validates origin and message type                             |
|  - Extracts integrationUuid or errorCode                         |
+------------------------------------------------------------------+
```

### File Structure

```
front/app/
├── hooks/
│   ├── api/integrations/
│   │   ├── useAuthorizeInstagram.ts    # Contains useCreateIntegration hook
│   │   ├── useListIntegrations.ts      # Hook to list integrations (flat list)
│   │   ├── useShowIntegrationProviderIcon.ts  # Hook to fetch provider icons
│   │   └── integrationQueryKeys.ts     # Query keys for integrations
│   ├── useOAuthPopup.ts                # Utility hook for popup management
│   └── useOAuthMessageListener.ts      # Utility hook for message listening
├── models/
│   ├── dtos/
│   │   ├── OAuthCallbackReponseDTO.ts  # DTO for callback response
│   │   └── IntegrationsGroupedByProviderDTO.ts  # @deprecated - kept for future use
│   └── enums/
│       ├── IntegrationProvider.ts      # Provider enum (Instagram, Youtube, etc.)
│       ├── IntegrationStatus.ts        # Integration status enum (Active, Revoked, Error)
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
+----------+     +--------------+     +---------+     +-----------+     +---------+
|Component |     |useAuthorize  |     |useOAuth |     | Callback  |     | Backend |
|          |     |Instagram     |     |Popup    |     | Route     |     |         |
+----+-----+     +------+-------+     +----+----+     +-----+-----+     +----+----+
     |                  |                  |                |                |
     | 1. authorize()   |                  |                |                |
     |----------------->|                  |                |                |
     |                  |                  |                |                |
     |                  | 2. GET /authorize|                |                |
     |                  |-------------------------------------------------->|
     |                  |                  |                |                |
     |                  | 3. auth_url      |                |                |
     |                  |<--------------------------------------------------|
     |                  |                  |                |                |
     |                  | 4. openPopup(url)|                |                |
     |                  |----------------->|                |                |
     |                  |                  |                |                |
     |                  |                  | 5. window.open |                |
     |                  |                  |--------------->|                |
     |                  |                  |                |                |
     |                  |                  |                | 6. User auth   |
     |                  |                  |                |--------------->|
     |                  |                  |                |                |
     |                  |                  |                | 7. Redirect    |
     |                  |                  |                |<---------------|
     |                  |                  |                |                |
     |                  |                  | 8. postMessage |                |
     |                  |                  |<---------------|                |
     |                  |                  |                |                |
     |                  |                  | 9. window.close|                |
     |                  |                  |                |                |
     |                  | 10. state update |                |                |
     |                  |<-----------------|                |                |
     |                  |                  |                |                |
     | 11. integrationUuid                 |                |                |
     |<-----------------|                  |                |                |
     |                  |                  |                |                |
```

### Step-by-Step Flow

1. **User clicks "Connect Instagram"** - Component calls `createIntegration()`
2. **API request** - `useCreateIntegration` calls `POST /api/integrations` with `projectUuid` and `provider`
3. **Backend validates** - Checks project exists and no existing integration for this provider
4. **Backend returns auth URL** - Instagram OAuth URL with state parameter
5. **Open popup** - `useOAuthPopup.openPopup(url)` opens centered popup window
6. **User authorizes** - User logs into Instagram and grants permissions
7. **Backend callback** - Instagram redirects to backend callback endpoint (`/api/integrations/callback`)
8. **Backend processes** - Exchanges code for token, creates integration, links to project
9. **Frontend callback** - Backend redirects to `/integrations/callback?status=success&...`
10. **postMessage** - Callback route sends message to opener window
11. **Message received** - `useOAuthMessageListener` receives and validates message
12. **State update** - `integrationUuid` or `oauthError` state is set
13. **Query invalidation** - `useCreateIntegration` invalidates integrations query
14. **Component reacts** - Component renders success/error UI

---

## Hooks

### useCreateIntegration

Generic API hook that orchestrates the OAuth flow for any provider.

```typescript
// Location: hooks/api/integrations/useAuthorizeInstagram.ts

interface UseCreateIntegrationProps {
    projectUuid: string;
    provider: IntegrationProvider;
}

export function useCreateIntegration({ projectUuid, provider }: UseCreateIntegrationProps) {
    const queryClient = useQueryClient();

    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        provider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
        },
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateIntegrationResponse>('/integrations', {
                projectUuid,
                provider: provider,
            });
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
        createIntegration: mutation.mutate,
        isPending: mutation.isPending || isOpen,
        integrationUuid,
        oauthError: oauthError ?? (mutation.error ? OAuthErrorCode.TokenExchangeFailed : null),
        error: mutation.error,
        reset,
    };
}
```

**Props:**
| Property | Type | Description |
|----------|------|-------------|
| `projectUuid` | `string` | UUID of the project to link the integration to |
| `provider` | `IntegrationProvider` | The integration provider (Instagram, etc.) |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `createIntegration` | `() => void` | Starts the OAuth flow |
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

interface UseOAuthPopupProps {
    provider: IntegrationProvider;
    onSuccess?: () => void;
}

/**
 * Utility hook to manage OAuth popup window and listen for callback messages
 */
export function useOAuthPopup({ provider, onSuccess }: UseOAuthPopupProps) {
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

    // Call onSuccess callback when integration is created
    useEffect(() => {
        if (integrationUuid && onSuccess) {
            onSuccess();
        }
    }, [integrationUuid, onSuccess]);

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

**Props:**
| Property | Type | Description |
|----------|------|-------------|
| `provider` | `IntegrationProvider` | The integration provider |
| `onSuccess` | `() => void` | Optional callback called when integration is created |

**Features:**
- Opens centered popup window (600x700)
- Detects popup blocked by browser
- Detects manual popup close
- Combines popup errors with message listener errors
- Calls `onSuccess` callback when integration is successfully created

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
    Youtube = "youtube",
    Tiktok = "tiktok",
}
```

### IntegrationStatus

```typescript
// Location: models/enums/IntegrationStatus.ts

export enum IntegrationStatus {
    Active = "active",
    Revoked = "revoked",
    Error = "error",
}
```

Used by the `Integration` model to represent the current state of an OAuth connection. The frontend uses this to decide rendering: Active integrations show data, Revoked integrations show the reconnect card (`CreateIntegrationCard`).

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
    [OAuthErrorCode.InvalidState]: "La session a expire. Veuillez reessayer.",
    [OAuthErrorCode.MissingCode]: "Code d'autorisation manquant.",
    [OAuthErrorCode.TokenExchangeFailed]: "Echec de la connexion. Veuillez reessayer.",
    [OAuthErrorCode.UserNotFound]: "Utilisateur non trouve.",
    [OAuthErrorCode.ProviderError]: "Erreur du fournisseur. Veuillez reessayer.",
    [OAuthErrorCode.PopupBlocked]: "Le popup a ete bloque. Veuillez autoriser les popups.",
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
export default function DashboardContent({ projectUuid }: { projectUuid: string }) {
    const { integrations, isLoading } = useListIntegrations({ projectUuid });
    const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
        projectUuid,
        provider: IntegrationProvider.Instagram,
    });

    const handleConnectInstagram = () => {
        reset();
        createIntegration();
    };

    if (isLoading) {
        return null;
    }

    if (integrations.length > 0 || integrationUuid) {
        return (
            <DashboardContent
                projectUuid={projectUuid}
                integrations={integrations}
            />
        );
    }

    return (
        <div>
            <h2>Insights</h2>
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

## Re-Authentication Flow (Revoked Integrations)

When an OAuth token is revoked (user revokes access in provider settings, token expires beyond renewal), the backend sets the integration status to `Revoked`. The frontend handles this gracefully:

### How It Works

1. **List endpoint returns all statuses** -- `GET /api/integrations` returns Active and Revoked integrations
2. **Dashboard routes by status** -- `DashboardContent` iterates over `integrationProviderTypeOptions` and checks the status:
   - **Active** integration -> `IntegrationCard` (shows profile + insight data)
   - **Revoked** or **missing** integration -> `CreateIntegrationCard` (shimmer placeholders + "Se connecter" button)
3. **User clicks "Se connecter"** -- Triggers the same `useCreateIntegration` hook / OAuth popup flow as initial setup
4. **Backend allows re-auth** -- `POST /api/integrations` checks for Active-only conflicts, so the revoked integration doesn't block the flow
5. **Callback reactivates** -- Backend's `handleCallback` finds the existing integration by `accountId`, calls `updateIntegrationToken` which resets status to `Active`
6. **Query invalidation** -- React Query refreshes the integration list, card updates to Active state

### Key Point

No separate re-auth UI or endpoint is needed. The existing `CreateIntegrationCard` + `useCreateIntegration` hook handles both initial setup and re-authentication identically.

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

### 2. Use the Generic Hook

The `useCreateIntegration` hook is generic and works with any provider. Simply pass the new provider:

```tsx
// In your component
const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
    projectUuid,
    provider: IntegrationProvider.TikTok,
});
```

No new hook is needed - the generic `useCreateIntegration` handles all providers.

### 3. Checklist

- [ ] Add provider to `IntegrationProvider` enum (frontend)
- [ ] Ensure backend has matching provider case in controller
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

---

## Integration Provider Icons

### Overview

Integration provider icons (e.g., Instagram logo) are served from the backend as SVG files.

### API Endpoint

`GET /api/integrations/providers/{provider}/icon`

Returns the SVG icon file for the specified provider.

### useShowIntegrationProviderIcon

**Location:** `hooks/api/integrations/useShowIntegrationProviderIcon.ts`

Fetches the icon for a specific integration provider.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `provider` | `string?` | The integration provider identifier |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `iconUrl` | `string \| null` | Blob URL for the icon |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error if any |

**Notes:**
- Returns a blob URL created from the SVG response
- Uses `staleTime: Infinity` to cache icons permanently
- Query is disabled if `provider` is undefined

### Query Keys

```typescript
const integrationQueryKeys = {
    all: ['integrations'] as const,
    list: (projectUuid: string) => [...integrationQueryKeys.all, 'list', projectUuid] as const,
    providerIcon: (provider: string) => [...integrationQueryKeys.all, 'providerIcon', provider] as const,
};
```
