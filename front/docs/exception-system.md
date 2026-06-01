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
| `src/services/apiErrorHandler/errorCodeMessages.ts` | Maps numeric error codes to i18n keys + `resolveErrorMessage` helper |
| `src/services/i18n/locales/errors/{en,fr}.json` | Translated error messages keyed by domain (e.g. `errors:agency.missing`) |
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

Takes any error, returns the localized user-facing message (resolved through i18next). Always returns a string (defaults to `errors:fallback`).

## Error Code Message Mapping

`errorCodeKeys` is a `Record<number, string>` mapping backend error codes to **i18n keys** (e.g. `errors:agency.missing`). The keys resolve to the messages in `services/i18n/locales/errors/{en,fr}.json`. Unknown codes fall back to `errors:fallback`.

The numeric code is computed by the backend as `DomainCode.value * 1000 + codeSuffix` (see `back/src/Exception/AppException.php` and `back/src/Exception/DomainCode.php`). Each domain owns a 1000-code block — e.g. Review (`DomainCode::Review = 33`) occupies `33xxx`.

### Current domain blocks

| Prefix | Domain | Frontend i18n namespace |
|---|---|---|
| 10xxx | Integration | `errors:integration.*` |
| 11xxx | AiClient | `errors:aiClient.*` |
| 12xxx | Credit | `errors:credit.*` |
| 13xxx | Stripe | `errors:stripe.*` |
| 14xxx | Mailing | `errors:mailing.*` |
| 15xxx | Otp | `errors:otp.*` |
| 16xxx | Prelaunch | `errors:prelaunch.*` |
| 17xxx | Project | `errors:project.*` |
| 18xxx | Script | `errors:script.*` |
| 19xxx | TodoList | `errors:todoList.*` |
| 20xxx | Post | `errors:post.*` |
| 21xxx | User | `errors:user.*` |
| 22xxx | Validation | `errors:validation.*` |
| 23xxx | Auth | `errors:auth.*` |
| 24xxx | Chat | `errors:chat.*` |
| 25xxx | ScriptPart | `errors:scriptPart.*` |
| 26xxx | ScriptPartSuggestion | `errors:scriptPartSuggestion.*` |
| 27xxx | Agency | `errors:agency.*` |
| 28xxx | HookTemplate | `errors:hookTemplate.*` |
| 29xxx | Invitation | `errors:invitation.*` |
| 30xxx | ProjectClient | `errors:projectClient.*` |
| 31xxx | AgencyCollaborator | `errors:agencyCollaborator.*` |
| 32xxx | Onboarding | `errors:onboarding.*` |
| 33xxx | Review | `errors:review.*` |

### Adding a new error code

1. Backend adds a new `AppException` subclass with a `self::CODE` constant (the suffix) and `getDomainCode()` returning the matching `DomainCode` case.
2. Add the resolved numeric code (`domainValue * 1000 + suffix`) + i18n key to `errorCodeMessages.ts`:
   ```ts
   33005: 'errors:review.somethingElse',
   ```
3. Add the message under that key in both `services/i18n/locales/errors/en.json` and `…/fr.json`.
4. The global handler (`handleMutationError`) will automatically show the correct toast.

#### Meta-driven resolution

When the same error code can carry several user-facing reasons (e.g. `ReviewFileInvalidException` / `AgencyLogoInvalidException` with `meta.reason`), mirror the backend enum under `models/enums/` along with a translation key map (see `FileInvalidReason.ts` / `OAuthErrorCode.ts`), then pass a resolver function instead of a string in `errorCodeMessages.ts`:

```ts
27004: (meta) => resolveFileInvalidReason(meta, 'errors:agency.logoInvalid'),
33001: (meta) => resolveFileInvalidReason(meta, 'errors:review.fileInvalid'),
```

The local `resolveFileInvalidReason(meta, fallbackKey)` helper looks up `meta.reason` in `FileInvalidReason` and falls back to the supplied key if the reason is missing or unknown. Add a similar helper if you introduce another shared meta enum.

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
