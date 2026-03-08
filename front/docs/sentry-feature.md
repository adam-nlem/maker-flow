# Sentry Frontend Integration

## Overview

Sentry is integrated on the frontend via `@sentry/react` to capture and report client-side errors, performance traces, and session replays. The setup mirrors the backend Sentry integration patterns (exception filtering, trace sampling).

## Packages

- `@sentry/react` — Core SDK for error monitoring, tracing, and session replay
- `@sentry/vite-plugin` — Uploads source maps to Sentry during production builds

## Configuration

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SENTRY_DSN` | `front/.env`, `docker-compose.yaml` | Sentry DSN for the frontend project (exposed to client via Vite) |
| `SENTRY_AUTH_TOKEN` | `front/.env`, `docker-compose.yaml` | Auth token for source map uploads |
| `SENTRY_ORG` | `front/.env`, `docker-compose.yaml` | Sentry organization slug |
| `SENTRY_PROJECT` | `front/.env`, `docker-compose.yaml` | Sentry project slug |

Setting `VITE_SENTRY_DSN` to empty disables the SDK entirely.

### Initialization

Sentry is initialized in `app/entry.client.tsx` **before** React hydration, as required by the SDK. The file:

1. Calls `Sentry.init()` with DSN, environment, integrations, and sample rates
2. Hydrates the React app with React 19 error handlers (`onUncaughtError`, `onCaughtError`, `onRecoverableError`) that automatically report errors to Sentry

### Sample Rates

| Setting | Value | Rationale |
|---------|-------|-----------|
| `tracesSampleRate` | `0.2` | Matches backend (20% of transactions) |
| `replaysSessionSampleRate` | `0.1` | Records 10% of normal sessions |
| `replaysOnErrorSampleRate` | `1.0` | Records 100% of sessions with errors |

### Integrations

- **`browserTracingIntegration()`** — Automatic page load and navigation performance tracing
- **`replayIntegration()`** — Session replay for debugging (text not masked, media not blocked)

## Exception Filtering

The `beforeSend` callback in `entry.client.tsx` filters exceptions to avoid noise, mirroring the backend pattern (`SentryBeforeSendCallback`):

| Exception Type | Reported? | Reason |
|----------------|-----------|--------|
| `CustomHttpException` with `statusCode < 500` (4xx) | No | Expected/handled errors (bad request, unauthorized, not found, etc.) |
| `InternalServerException` (500) | Yes | Server errors — explicitly captured in `apiErrorHandler.ts` |
| Unhandled JavaScript errors | Yes | Frontend bugs caught by React 19 error handlers |
| React rendering errors | Yes | Caught by `ErrorBoundary` in `root.tsx` |

## Error Capture Points

### 1. React 19 Error Handlers (`entry.client.tsx`)
`hydrateRoot` is configured with `Sentry.reactErrorHandler()` for:
- `onUncaughtError` — Unhandled errors that bubble up
- `onCaughtError` — Errors caught by error boundaries
- `onRecoverableError` — Hydration mismatches and recoverable errors

### 2. ErrorBoundary (`root.tsx`)
The root `ErrorBoundary` calls `Sentry.captureException(error)` for non-route-error-response errors (actual exceptions, not 404s).

### 3. API Error Handler (`apiErrorHandler.ts`)
The centralized error handler calls `Sentry.captureException(error)` specifically for `InternalServerException` (500 errors), providing frontend context for server errors.

## Source Maps

Source maps are uploaded to Sentry via `@sentry/vite-plugin` during production builds (`npm run build`). The Vite config uses `sourcemap: "hidden"` to generate source maps without exposing them to end users.

Configuration in `vite.config.ts`:
- `build.sourcemap: "hidden"`
- `sentryVitePlugin({ org, project, authToken })` — reads from environment variables

## Key Files

| File | Role |
|------|------|
| `app/entry.client.tsx` | Sentry initialization + React 19 error handlers |
| `app/root.tsx` | ErrorBoundary with `Sentry.captureException` |
| `app/services/apiErrorHandler/apiErrorHandler.ts` | 5xx error reporting to Sentry |
| `app/services/httpClient/customHttpExceptions.ts` | Exception classes used in `beforeSend` filter |
| `vite.config.ts` | Source map upload plugin |

## Testing

1. Verify Sentry initializes without errors in the browser console
2. Trigger a JavaScript error — should appear in Sentry Issues
3. Trigger a 404 navigation — should NOT appear in Sentry
4. Trigger a 500 API error — should appear in Sentry
5. Run `npm run build` with valid `SENTRY_AUTH_TOKEN` — source maps should upload
