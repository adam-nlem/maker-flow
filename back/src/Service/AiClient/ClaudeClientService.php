<?php

namespace App\Service\AiClient;

use App\Service\AiClient\Exception\AiClientPermanentException;
use App\Service\AiClient\Exception\AiClientRetryableException;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ClaudeClientService implements AiClientInterface
{
    private const REQUEST_TIMEOUT = 120;
    private const MODEL = 'claude-sonnet-4-6';
    private const MAX_TOKENS = 8096;
    private const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504, 529];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $claudeApiKey,
    ) {
    }

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
                ],
                'timeout' => self::REQUEST_TIMEOUT,
            ]);

            $rawContent = $response->getContent(false);
            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            throw new AiClientRetryableException(
                'Claude API network error: ' . $e->getMessage(),
                previous: $e,
            );
        }

        $this->logger->info('Claude API raw response', [
            'status_code' => $statusCode,
            'raw_response' => $rawContent,
        ]);

        if ($statusCode >= 400) {
            $message = sprintf('Claude API error (HTTP %d): %s', $statusCode, $rawContent);

            if (in_array($statusCode, self::RETRYABLE_STATUS_CODES, true)) {
                throw new AiClientRetryableException($message, $statusCode);
            }

            throw new AiClientPermanentException($message, $statusCode);
        }

        $data = json_decode($rawContent, true);

        if (!isset($data['content'][0]['text'])) {
            throw new AiClientPermanentException('Unexpected response structure from Claude API');
        }

        $text = $data['content'][0]['text'];

        $this->logger->info('Claude API generation complete', [
            'output_length' => strlen($text),
        ]);

        return $text;
    }
}
