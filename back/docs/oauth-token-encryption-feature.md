# OAuth Token Encryption at Rest

## Overview

OAuth `accessToken` and `refreshToken` fields on the `Integration` entity are encrypted at rest using authenticated symmetric encryption. Encryption and decryption are fully transparent to all callers via a Doctrine entity listener.

## Algorithm

- **Cipher**: `sodium_crypto_secretbox` (XSalsa20-Poly1305) — authenticated encryption, built into PHP 8.x
- **Key**: 32-byte binary key derived from a 64-character hex string (`APP_ENCRYPTION_KEY` env var)
- **Nonce**: 24-byte random nonce generated per encryption call
- **Storage format**: `base64url_nopadding(nonce[24 bytes] + ciphertext)` stored in the existing TEXT column

## Architecture

### TokenEncryptionService

**File**: `src/Service/Encryption/TokenEncryptionService.php`

Stateless encrypt/decrypt service. Receives the hex key via constructor injection, converts to binary, validates length.

- `encrypt(string $plaintext): string` — generates nonce, encrypts, returns base64url-encoded result
- `decrypt(string $ciphertext): string` — decodes, splits nonce/ciphertext, decrypts, throws `\RuntimeException` on failure

### IntegrationTokenEncryptionListener

**File**: `src/EventListener/IntegrationTokenEncryptionListener.php`

Doctrine entity listener registered on the `Integration` entity via `#[ORM\EntityListeners]`.

| Event | Action |
|-------|--------|
| `prePersist` | Encrypts `accessToken` and `refreshToken` before INSERT |
| `preUpdate` | Encrypts `accessToken` and `refreshToken` before UPDATE |
| `postLoad` | Decrypts tokens after SELECT |
| `postPersist` | Decrypts tokens back in-memory after INSERT (entity stays usable) |
| `postUpdate` | Decrypts tokens back in-memory after UPDATE (entity stays usable) |

### Event Flow

```
[Service sets plaintext token on entity]
        │
        ▼
  prePersist / preUpdate
  → encrypt accessToken & refreshToken
        │
        ▼
  Doctrine writes ciphertext to DB
        │
        ▼
  postPersist / postUpdate
  → decrypt back so entity has plaintext in-memory
```

## Configuration

### Environment Variable

```env
# 32-byte key as hex (64 chars)
# Generate with: php -r "echo bin2hex(random_bytes(32));"
APP_ENCRYPTION_KEY=<64-char-hex-string>
```

### Services (services.yaml)

- Parameter: `app.encryption.token_key` resolves `APP_ENCRYPTION_KEY`
- `TokenEncryptionService`: receives `$encryptionKey` from the parameter
- `IntegrationTokenEncryptionListener`: tagged with 5 `doctrine.orm.entity_listener` tags (lazy)

## Key Management

- Store the key in `.env.local` (not committed) or via real environment variables in production
- **Never commit the key** to version control
- If the key is lost, all encrypted tokens become unrecoverable — integrations must be re-connected
- Key rotation requires decrypting all tokens with the old key and re-encrypting with the new key

## Migration Notes

- **No DB migration required**: the `accessToken` and `refreshToken` columns remain `TEXT`
- **Existing plaintext tokens**: must delete all existing `Integration` rows before enabling encryption, as plaintext values will fail decryption
- To clear existing integrations: `DELETE FROM integration`

## Related Files

- `src/Entity/Integration.php` — `#[ORM\EntityListeners]` attribute
- `src/Service/Encryption/TokenEncryptionService.php` — encryption logic
- `src/EventListener/IntegrationTokenEncryptionListener.php` — Doctrine lifecycle hooks
- `config/services.yaml` — service wiring and parameter
