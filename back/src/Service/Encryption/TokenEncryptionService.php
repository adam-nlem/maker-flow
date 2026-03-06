<?php

namespace App\Service\Encryption;

final class TokenEncryptionService
{
    private string $key;

    public function __construct(string $encryptionKey)
    {
        $this->key = sodium_hex2bin($encryptionKey);

        if (strlen($this->key) !== SODIUM_CRYPTO_SECRETBOX_KEYBYTES) {
            throw new \InvalidArgumentException(
                sprintf('APP_ENCRYPTION_KEY must be a %d-byte hex string (%d chars)', SODIUM_CRYPTO_SECRETBOX_KEYBYTES, SODIUM_CRYPTO_SECRETBOX_KEYBYTES * 2)
            );
        }
    }

    public function encrypt(string $plaintext): string
    {
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $ciphertext = sodium_crypto_secretbox($plaintext, $nonce, $this->key);

        return sodium_bin2base64($nonce . $ciphertext, SODIUM_BASE64_VARIANT_URLSAFE_NO_PADDING);
    }

    public function decrypt(string $ciphertext): string
    {
        $decoded = sodium_base642bin($ciphertext, SODIUM_BASE64_VARIANT_URLSAFE_NO_PADDING);
        $nonce = substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $encrypted = substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $plaintext = sodium_crypto_secretbox_open($encrypted, $nonce, $this->key);

        if ($plaintext === false) {
            throw new \RuntimeException('Failed to decrypt token: invalid key or corrupted data');
        }

        return $plaintext;
    }
}
