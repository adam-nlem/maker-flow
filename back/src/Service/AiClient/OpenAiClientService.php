<?php

namespace App\Service\AiClient;

use App\Service\AiClient\Exception\AiClientPermanentException;
use App\Service\AiClient\Exception\AiClientRetryableException;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class OpenAiClientService implements AiClientInterface
{
    private const REQUEST_TIMEOUT = 120;
    private const MODEL = 'gpt-4o';
    private const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $openAiApiKey,
    ) {
    }

    public function generateScript(string $prompt): string
    {
        $this->logger->info('OpenAI API request starting', [
            'model' => self::MODEL,
            'prompt_length' => strlen($prompt),
        ]);

        try {
            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->openAiApiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => self::MODEL,
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
                'OpenAI API network error: ' . $e->getMessage(),
                previous: $e,
            );
        }

        $this->logger->info('OpenAI API raw response', [
            'status_code' => $statusCode,
            'raw_response' => $rawContent,
        ]);

        if ($statusCode >= 400) {
            $message = sprintf('OpenAI API error (HTTP %d): %s', $statusCode, $rawContent);

            if (in_array($statusCode, self::RETRYABLE_STATUS_CODES, true)) {
                throw new AiClientRetryableException($message, $statusCode);
            }

            throw new AiClientPermanentException($message, $statusCode);
        }

        $data = json_decode($rawContent, true);

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new AiClientPermanentException('Unexpected response structure from OpenAI API');
        }

        $text = $data['choices'][0]['message']['content'];

        $this->logger->info('OpenAI API generation complete', [
            'output_length' => strlen($text),
        ]);

        return $text;
    }
}
