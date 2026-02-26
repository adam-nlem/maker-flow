<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GeminiClientService
{
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
        ]);

        $rawContent = $response->getContent(false);
        $statusCode = $response->getStatusCode();

        $this->logger->info('Gemini API raw response', [
            'status_code' => $statusCode,
            'raw_response' => $rawContent,
        ]);

        if ($statusCode >= 400) {
            throw new \RuntimeException(sprintf('Gemini API error (HTTP %d): %s', $statusCode, $rawContent));
        }

        $data = json_decode($rawContent, true);

        if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \RuntimeException('Unexpected response structure from Gemini API');
        }

        $text = $data['candidates'][0]['content']['parts'][0]['text'];

        $this->logger->info('Gemini API generation complete', [
            'output_length' => strlen($text),
        ]);

        return $text;
    }
}
