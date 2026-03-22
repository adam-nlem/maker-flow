# Exception System (Frontend)

Frontend handling of structured numeric error codes from the backend `AppException` system.

## Error Response Format

The backend returns errors in this format:

```json
{
  "code": 15001,
  "httpStatus": 422,
  "meta": { "remainingAttempts": 2 }
}
```

## Key Files

| File | Purpose |
|------|---------|
| `src/models/dtos/ErrorResponseDTO.ts` | DTO class with `tryFrom(data)` factory for parsing error responses |
| `src/services/httpClient/HttpException.ts` | Single exception class thrown by the HTTP interceptor |
| `src/services/httpClient/httpClient.ts` | Axios interceptor — creates `HttpException` for all errors |
| `src/services/apiErrorHandler/errorCodeMessages.ts` | Maps numeric error codes to French messages + `resolveErrorMessage` helper |
| `src/services/apiErrorHandler/apiErrorHandler.ts` | Global mutation error handler |

## `ErrorResponseDTO`

```ts
class ErrorResponseDTO {
    readonly code: number        // numeric error code (e.g., 15001)
    readonly httpStatus: number  // HTTP status (e.g., 422)
    readonly meta: Record<string, unknown>

    static fromJSON(json: ErrorResponseJSON): ErrorResponseDTO
    static tryFrom(data: unknown): ErrorResponseDTO | null  // safe parsing from unknown data
}
```

## `HttpException`

Single exception class replacing the old `CustomHttpException` hierarchy. Extends `Error` and always carries an `ErrorResponseDTO`:

```ts
class HttpException extends Error {
    readonly response: ErrorResponseDTO

    constructor(httpStatus: number, data?: unknown)
}
```

- If the response data matches the `{ code, httpStatus, meta }` shape → parsed into `ErrorResponseDTO`
- Otherwise → fallback `ErrorResponseDTO(99999, httpStatus, {})`

## `resolveErrorMessage`

```ts
function resolveErrorMessage(error: unknown): string
```

Takes any error, returns the French user-facing message. Always returns a string (defaults to generic fallback `99999`).

## Error Code Message Mapping

`errorCodeMessages` is a `Record<number, string>` mapping backend error codes to French messages. Code `99999` is the generic fallback.

### Adding a new error code

1. Backend adds a new `AppException` with a code (e.g., `17001`)
2. Add the code + French message to `errorCodeMessages.ts`:
   ```ts
   17001: 'Le projet est introuvable.',
   ```
3. The global handler (`handleMutationError`) will automatically show the correct toast

## How It Works

### Global handling (automatic)

All mutation and query errors flow through `handleMutationError` via React Query's `MutationCache.onError` and `QueryCache.onError`:

1. 401 → clear session + redirect to login
2. 5xx → capture in Sentry
3. All errors → `resolveErrorMessage(error)` → toast

### Inline handling (per-component)

Components that show inline errors (not just toasts) use `resolveErrorMessage` directly:

```tsx
import { HttpException } from '~/services/httpClient/HttpException'
import { resolveErrorMessage } from '~/services/apiErrorHandler/errorCodeMessages'

catch (err) {
  if (err instanceof HttpException) {
    setError(resolveErrorMessage(err))
  }
}
```

### HTTP status checks

For specific HTTP status handling (e.g., 402 payment required):

```tsx
if (error instanceof HttpException && error.response.httpStatus === 402) {
    // handle payment required
}
```
