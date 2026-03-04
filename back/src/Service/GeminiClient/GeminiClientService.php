<?php

namespace App\Service\GeminiClient;

use App\Service\AiClient\AiClientInterface;
use App\Service\AiClient\Exception\AiClientPermanentException;
use App\Service\AiClient\Exception\AiClientRetryableException;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GeminiClientService implements AiClientInterface
{
    private const REQUEST_TIMEOUT = 120;
    private const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $geminiApiKey,
    ) {
    }

    public function generateScript(string $prompt): string
    {
        $this->logger->info('Gemini API request starting', [
            'model' => 'gemini-3-pro-preview',
            'prompt_length' => strlen($prompt),
        ]);

        try {
            $response = $this->httpClient->request('POST', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent', [
                'query' => [
                    'key' => $this->geminiApiKey,
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                ],
                'timeout' => self::REQUEST_TIMEOUT,
            ]);

            $rawContent = $response->getContent(false);
            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Gemini API network error', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('Gemini API network error', previous: $e);
        }

        $this->logger->info('Gemini API raw response', [
            'status_code' => $statusCode,
            'raw_response' => $rawContent,
        ]);

        if ($statusCode >= 400) {
            $this->logger->error('Gemini API HTTP error', ['status_code' => $statusCode, 'raw_response' => $rawContent]);
            $message = sprintf('Gemini API error (HTTP %d)', $statusCode);

            if (in_array($statusCode, self::RETRYABLE_STATUS_CODES, true)) {
                throw new AiClientRetryableException($message, $statusCode);
            }

            throw new AiClientPermanentException($message, $statusCode);
        }

        $data = json_decode($rawContent, true);

        if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            throw new AiClientPermanentException('Unexpected response structure from Gemini API');
        }

        $text = $data['candidates'][0]['content']['parts'][0]['text'];

        $this->logger->info('Gemini API generation complete', [
            'output_length' => strlen($text),
        ]);

        return $text;
    }
}
