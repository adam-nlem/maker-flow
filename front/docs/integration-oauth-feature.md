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
|      = useCreateIntegration({ projectUuid, platform });           |
+----------------------------+-------------------------------------+
                             |
                             v
+------------------------------------------------------------------+
|                    useCreateIntegration                            |
|                                                                   |
|  - Calls POST /api/integrations with projectUuid & platform      |
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
|  - Validates origin, message type, and platform                  |
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
│   │   └── integrationQueryKeys.ts     # Query keys for integrations
│   ├── useOAuthPopup.ts                # Utility hook for popup management
│   └── useOAuthMessageListener.ts      # Utility hook for message listening
├── models/
│   ├── dtos/
│   │   ├── OAuthCallbackReponseDTO.ts  # DTO for callback response
│   │   └── IntegrationsGroupedByPlatformDTO.ts  # @deprecated - kept for future use
│   └── enums/
│       ├── Platform.ts               # Platform enum (Instagram, Youtube, Tiktok)
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
2. **API request** - `useCreateIntegration` calls `POST /api/integrations` with `projectUuid` and `platform`
3. **Backend validates** - Checks project exists and no existing integration for this platform
4. **Backend returns auth URL** - Instagram OAuth URL with state parameter
5. **Open popup** - `useOAuthPopup.openPopup(url)` opens centered popup window
6. **User authorizes** - User logs into Instagram and grants permissions
7. **Backend callback** - Instagram redirects to backend callback endpoint (`/api/integrations/callback`)
8. **Backend processes** - Exchanges code for token, creates integration, links to project
9. **Frontend callback** - Backend redirects to `/integrations/callback?status=success&...`
10. **postMessage** - Callback route sends message to opener window (may fail if `window.opener` is severed by COOP headers)
11. **Message received** - `useOAuthMessageListener` receives and validates message
11b. **Popup closed** - `useOAuthPopup` detects popup closure and triggers query invalidation as a fallback
12. **State update** - `integrationUuid` or `oauthError` state is set
13. **Query invalidation** - `useCreateIntegration` invalidates integrations query
14. **Component reacts** - Component renders success/error UI

---

## Hooks

### useCreateIntegration

Generic API hook that orchestrates the OAuth flow for any platform.

```typescript
// Location: hooks/api/integrations/useAuthorizeInstagram.ts

interface UseCreateIntegrationProps {
    projectUuid: string;
    platform: Platform;
}

export function useCreateIntegration({ projectUuid, platform }: UseCreateIntegrationProps) {
    const queryClient = useQueryClient();

    const handleOAuthSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
    }, [queryClient, projectUuid]);

    const {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError,
        reset: resetOAuth,
    } = useOAuthPopup({
        platform,
        onSuccess: handleOAuthSuccess,
        onPopupClosed: handleOAuthSuccess,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateIntegrationResponse>('/integrations', {
                projectUuid,
                platform: platform,
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
| `platform` | `Platform` | The integration platform (Instagram, etc.) |

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
    platform: Platform;
    onSuccess?: () => void;
}

/**
 * Utility hook to manage OAuth popup window and listen for callback messages
 */
export function useOAuthPopup({ platform, onSuccess }: UseOAuthPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popupError, setPopupError] = useState<OAuthErrorCode | null>(null);
    const popupRef = useRef<Window | null>(null);

    const {
        integrationUuid,
        oauthError: messageError,
        reset: resetMessageListener,
    } = useOAuthMessageListener({ platform });

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
    }, [isOpen, platform, resetMessageListener]);

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
| `platform` | `Platform` | The integration platform |
| `onSuccess` | `() => void` | Optional callback called when integration is created (via postMessage) |
| `onPopupClosed` | `() => void` | Optional callback called when the popup window closes (reliable fallback) |

**Features:**
- Opens centered popup window (600x700)
- Detects popup blocked by browser
- Detects manual popup close and calls `onPopupClosed`
- Combines popup errors with message listener errors
- Calls `onSuccess` callback when integration is successfully created via postMessage

---

### useOAuthMessageListener

Utility hook that listens for postMessage from the OAuth callback popup.

```typescript
// Location: hooks/useOAuthMessageListener.ts

export function useOAuthMessageListener({ platform }: UseOAuthMessageListenerProps) {
    const [integrationUuid, setIntegrationUuid] = useState<string | null>(null);
    const [oauthError, setOauthError] = useState<OAuthErrorCode | null>(null);

    const handleMessage = useCallback((event: MessageEvent<OAuthCallbackMessage>) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== WindowMessageType.OAuthCallback) return;

        const { payload } = event.data;
        if (payload.platform !== platform) return;

        if (payload.status === OAuthCallbackStatus.Success && payload.integrationUuid) {
            setIntegrationUuid(payload.integrationUuid);
            setOauthError(null);
        } else if (payload.status === OAuthCallbackStatus.Error && payload.errorCode) {
            setOauthError(payload.errorCode);
            setIntegrationUuid(null);
        }
    }, [platform]);

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
- Filters by platform to support multiple integrations

**Note:** The postMessage mechanism may fail when OAuth providers set `Cross-Origin-Opener-Policy` headers that sever `window.opener`. The `onPopupClosed` callback in `useOAuthPopup` provides a reliable fallback by invalidating the query when the popup closes.

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
| `platform` | `instagram` | Integration platform |
| `errorCode` | `string?` | Error code if status is error |
| `integrationUuid` | `string?` | Integration UUID if status is success |

---

## Enums

### Platform

```typescript
// Location: models/enums/Platform.ts

export enum Platform {
    Instagram = 'instagram',
    Youtube = 'youtube',
    Tiktok = 'tiktok',
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
    PlatformError = "platform_error",
    PopupBlocked = "popup_blocked",
}

export const oAuthErrorCodeToFrenchTranslation: Record<OAuthErrorCode, string> = {
    [OAuthErrorCode.InvalidState]: "La session a expire. Veuillez reessayer.",
    [OAuthErrorCode.MissingCode]: "Code d'autorisation manquant.",
    [OAuthErrorCode.TokenExchangeFailed]: "Echec de la connexion. Veuillez reessayer.",
    [OAuthErrorCode.UserNotFound]: "Utilisateur non trouve.",
    [OAuthErrorCode.PlatformError]: "Erreur du fournisseur. Veuillez reessayer.",
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
        public readonly platform: Platform,
        public readonly errorCode?: OAuthErrorCode,
        public readonly integrationUuid?: string,
    ) {}

    static fromSearchParams(params: URLSearchParams): OAuthCallbackReponseDTO {
        return new OAuthCallbackReponseDTO(
            params.get("status") as OAuthCallbackStatus,
            params.get("platform") as Platform,
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
        platform: Platform.Instagram,
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

When an OAuth token is revoked (user revokes access in platform settings, token expires beyond renewal), the backend sets the integration status to `Revoked`. The frontend handles this gracefully:

### How It Works

1. **List endpoint returns all statuses** -- `GET /api/integrations` returns Active and Revoked integrations
2. **Dashboard routes by status** -- `DashboardContent` iterates over `platformOptions` and checks the status:
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

### 1. Add Platform Enum Case

```typescript
// models/enums/Platform.ts
export enum Platform {
    Instagram = 'instagram',
    Youtube = 'youtube',
    Tiktok = 'tiktok',
    NewPlatform = 'new_platform',  // Add new platform
}
```

### 2. Use the Generic Hook

The `useCreateIntegration` hook is generic and works with any platform. Simply pass the new platform:

```tsx
// In your component
const { createIntegration, isPending, integrationUuid, oauthError, reset } = useCreateIntegration({
    projectUuid,
    platform: Platform.TikTok,
});
```

No new hook is needed - the generic `useCreateIntegration` handles all platforms.

### 3. Checklist

- [ ] Add platform case to `Platform` enum (frontend)
- [ ] Ensure backend has matching platform case in controller
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

### Platform Filtering

Each listener only processes messages for its specific platform:

```typescript
if (payload.platform !== platform) {
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
| Platform | User denied | `OAuthErrorCode.PlatformError` |

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
3. **User denies** - Platform error handled
4. **User closes popup** - State resets correctly
5. **Direct navigation** - Callback route redirects to home
6. **Multiple platforms** - Messages filtered correctly

---

## Platform Icons

### Overview

Platform icons are served as static SVG files from `front/public/icons/platforms/`. There is no API call involved — icons are resolved via a lookup in the `platformToIcon` map from the `Platform` enum.

### Static Assets

Icons are located at `front/public/icons/platforms/{platform}.svg`:
- `instagram.svg`
- `youtube.svg`
- `tiktok.svg`
- `placeholder.svg` (fallback)

### platformToIcon

**Location:** `models/enums/Platform.ts`

Maps each `Platform` enum value to its static asset path.

```typescript
export const platformToIcon: Record<Platform, string> = {
    [Platform.Instagram]: "/icons/platforms/instagram.svg",
    [Platform.Youtube]: "/icons/platforms/youtube.svg",
    [Platform.Tiktok]: "/icons/platforms/tiktok.svg",
}

export const PLATFORM_PLACEHOLDER_ICON = "/icons/platforms/placeholder.svg";
```

**Usage:**
```tsx
import { platformToIcon, PLATFORM_PLACEHOLDER_ICON } from "~/models/enums/Platform";

const iconUrl = platformToIcon[platform] ?? PLATFORM_PLACEHOLDER_ICON;
<img src={iconUrl} alt={platform} />
```

**Notes:**
- No network request — icons are bundled with the frontend static assets
- Used by `IntegrationCard`, `IntegrationTile`, `CreateIntegrationCard`, `ScriptPlatformsRow`, and `IntegrationSettingCard`

---

## Integration Settings Page

The `/settings/integration` route allows users to manage their social media connections from a dedicated settings section.

### Location
- **Page component:** `front/app/components/settings/IntegrationSettings.tsx`
- **Card component:** `front/app/components/settings/integration/IntegrationSettingCard.tsx`
- **Delete hook:** `front/app/hooks/api/integrations/useDeleteIntegration.ts`
- **Route wrapper:** `IntegrationSettingsWrapper` in `front/app/routes/settings.section.tsx`

### Architecture

Integrations are per-project. `IntegrationSettingsWrapper` resolves the focused project UUID and passes it to `IntegrationSettings`, which then renders one `IntegrationSettingCard` per platform.

```
settings.section.tsx
  └── IntegrationSettingsWrapper  (resolves projectUuid from focused project)
        └── IntegrationSettings   (lists all platforms)
              └── IntegrationSettingCard × 3  (one per platform)
```

### IntegrationSettingCard

Each card shows:
- Platform icon + name + status badge (Connecté / Expiré / Erreur / Non connecté)
- Connected: profile picture, display name, `@username`, last sync date
- Disconnected: "Aucun compte connecté."
- Actions: `[Déconnecter]` (with confirm dialog) and/or `[Connecter / Reconnecter]`

**Status badge classes:**
| Status | Classes |
|---|---|
| `Active` | `bg-primary/10 text-primary` |
| `Revoked` | `bg-yellow/10 text-yellow` |
| `Error` | `bg-danger/10 text-danger` |
| No integration | `bg-light-gray text-gray` |

**Reconnect logic:** The reconnect button is shown when there is no integration OR when the integration status is not `Active` (i.e., `Revoked` or `Error`). Disconnect is available whenever an integration exists.

### useDeleteIntegration

```ts
const { deleteIntegration, isPending } = useDeleteIntegration({ projectUuid });
await deleteIntegration(integrationUuid);
```

Calls `DELETE /api/integrations/{integrationUuid}` and invalidates `integrationQueryKeys.list(projectUuid)` on success.
