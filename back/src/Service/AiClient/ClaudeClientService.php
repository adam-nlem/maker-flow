<?php

namespace App\Service\AiClient;

use App\Exception\AiClient\AiClientPermanentException;
use App\Exception\AiClient\AiClientRetryableException;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ClaudeClientService implements AiClientInterface
{
    private const CHUNK_TIMEOUT = 60;
    private const MODEL = 'claude-sonnet-4-6';
    private const MAX_TOKENS = 8096;
    private const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504, 529];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $claudeApiKey,
    ) {}

    public function generateScript(string $prompt): string
    {
        $this->logger->info('Claude API request starting', [
            'model' => self::MODEL,
            'prompt_length' => strlen($prompt),
        ]);

        try {
            $response = $this->httpClient->request('POST', 'https://api.anthropic.com/v1/messages', [
                'headers' => [
                    'x-api-key' => $this->claudeApiKey,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => self::MODEL,
                    'max_tokens' => self::MAX_TOKENS,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'stream' => true,
                ],
            ]);

            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Claude API network error', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('Claude API network error', previous: $e);
        }

        if ($statusCode >= 400) {
            try {
                $rawContent = $response->getContent(false);
            } catch (TransportExceptionInterface $e) {
                throw new AiClientRetryableException('Claude API network error reading error response', previous: $e);
            }

            $this->logger->error('Claude API HTTP error', ['status_code' => $statusCode, 'raw_response' => $rawContent]);
            $message = sprintf('Claude API error (HTTP %d)', $statusCode);

            if (in_array($statusCode, self::RETRYABLE_STATUS_CODES, true)) {
                throw new AiClientRetryableException($message, $statusCode);
            }

            throw new AiClientPermanentException($message, $statusCode);
        }

        $rawContent = '';
        try {
            foreach ($this->httpClient->stream($response, self::CHUNK_TIMEOUT) as $chunk) {
                $rawContent .= $chunk->getContent();
            }
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Claude API streaming interrupted', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('Claude API streaming interrupted', previous: $e);
        }

        $this->logger->info('Claude API streaming complete', [
            'raw_length' => strlen($rawContent),
        ]);

        $text = $this->parseStreamedResponse($rawContent);

        $this->logger->info('Claude API generation complete', [
            'output_length' => strlen($text),
        ]);

        return $text;
    }

    private function parseStreamedResponse(string $rawContent): string
    {
        $text = '';
        $lines = explode("\n", $rawContent);

        foreach ($lines as $line) {
            $line = trim($line);

            if (!str_starts_with($line, 'data: ')) {
                continue;
            }

            $json = json_decode(substr($line, 6), true);

            if ($json === null) {
                continue;
            }

            if (($json['type'] ?? null) === 'content_block_delta' && isset($json['delta']['text'])) {
                $text .= $json['delta']['text'];
            }
        }

        if ($text === '') {
            throw new AiClientPermanentException('Unexpected response structure from Claude API');
        }

        return $text;
    }
}
