<?php

namespace App\Service\AiClient;

use App\Exception\AiClient\AiClientPermanentException;
use App\Exception\AiClient\AiClientRetryableException;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class OpenAiClientService implements AiClientInterface
{
    private const CHUNK_TIMEOUT = 60;
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
                    'stream' => true,
                ],
            ]);

            $statusCode = $response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('OpenAI API network error', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('OpenAI API network error', previous: $e);
        }

        if ($statusCode >= 400) {
            try {
                $rawContent = $response->getContent(false);
            } catch (TransportExceptionInterface $e) {
                throw new AiClientRetryableException('OpenAI API network error reading error response', previous: $e);
            }

            $this->logger->error('OpenAI API HTTP error', ['status_code' => $statusCode, 'raw_response' => $rawContent]);
            $message = sprintf('OpenAI API error (HTTP %d)', $statusCode);

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
            $this->logger->error('OpenAI API streaming interrupted', ['error' => $e->getMessage()]);
            throw new AiClientRetryableException('OpenAI API streaming interrupted', previous: $e);
        }

        $this->logger->info('OpenAI API streaming complete', [
            'raw_length' => strlen($rawContent),
        ]);

        $text = $this->parseStreamedResponse($rawContent);

        $this->logger->info('OpenAI API generation complete', [
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

            $data = substr($line, 6);

            if ($data === '[DONE]') {
                break;
            }

            $json = json_decode($data, true);

            if ($json === null) {
                continue;
            }

            if (isset($json['choices'][0]['delta']['content'])) {
                $text .= $json['choices'][0]['delta']['content'];
            }
        }

        if ($text === '') {
            throw new AiClientPermanentException('Unexpected response structure from OpenAI API');
        }

        return $text;
    }
}
