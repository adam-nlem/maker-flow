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
    private const CHUNK_TIMEOUT = 60;
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
            $response = $this->httpClient->request('POST', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:streamGenerateContent', [
                'query' => [
                    'key' => $this->geminiApiKey,
                    'alt' => 'sse',
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
            ]);

            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Gemini API network error', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('Gemini API network error', previous: $e);
        }

        if ($statusCode >= 400) {
            try {
                $rawContent = $response->getContent(false);
            } catch (TransportExceptionInterface $e) {
                throw new AiClientRetryableException('Gemini API network error reading error response', previous: $e);
            }

            $this->logger->error('Gemini API HTTP error', ['status_code' => $statusCode, 'raw_response' => $rawContent]);
            $message = sprintf('Gemini API error (HTTP %d)', $statusCode);

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
            $this->logger->error('Gemini API streaming interrupted', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('Gemini API streaming interrupted', previous: $e);
        }

        $this->logger->info('Gemini API streaming complete', [
            'raw_length' => strlen($rawContent),
        ]);

        $text = $this->parseStreamedResponse($rawContent);

        $this->logger->info('Gemini API generation complete', [
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

            if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                $text .= $json['candidates'][0]['content']['parts'][0]['text'];
            }
        }

        if ($text === '') {
            throw new AiClientPermanentException('Unexpected response structure from Gemini API');
        }

        return $text;
    }
}
