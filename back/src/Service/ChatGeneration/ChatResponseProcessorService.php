<?php

namespace App\Service\ChatGeneration;

use App\Entity\Chat;
use App\Entity\Enum\ChatAction;
use App\Entity\Enum\MessageType;
use App\Entity\Enum\ScriptVersionStatus;
use App\Entity\Message;
use App\Entity\Script;
use App\Entity\ScriptVersion;
use App\Entity\User;
use App\Repository\MessageRepository;
use App\Repository\ScriptVersionRepository;
use App\Service\ScriptOutputParser\ScriptOutputParserService;

class ChatResponseProcessorService
{
    public function __construct(
        private readonly MessageRepository $messageRepository,
        private readonly ScriptVersionRepository $scriptVersionRepository,
        private readonly ScriptOutputParserService $outputParserService,
    ) {}

    public function processOutput(string $output, ChatAction $chatAction, Chat $chat, Script $script, User $user): void
    {
        match ($chatAction) {
            ChatAction::GenerateScript => $this->processGenerateScript($output, $chat, $script, $user),
            ChatAction::ImproveHook => $this->processImproveHook($output, $chat),
            ChatAction::AnalyzeScript => $this->processAnalyzeScript($output, $chat),
            ChatAction::FreeChat => $this->processFreeChat($output, $chat, $script, $user),
        };
    }

    public function createAiMessage(Chat $chat, string $content): Message
    {
        $aiMessage = new Message();
        $aiMessage
            ->setChat($chat)
            ->setType(MessageType::Ai)
            ->setContent($content);
        $this->messageRepository->save($aiMessage);

        return $aiMessage;
    }

    private function processGenerateScript(string $output, Chat $chat, Script $script, User $user): void
    {
        $aiMessage = $this->createAiMessage($chat, "Voici une nouvelle version de votre script.");

        $scriptVersion = new ScriptVersion();
        $scriptVersion
            ->setStatus(ScriptVersionStatus::Draft)
            ->setScript($script)
            ->setChat($chat)
            ->setMessage($aiMessage)
            ->setUser($user);
        $this->scriptVersionRepository->save($scriptVersion);

        $this->outputParserService->parseAndCreatePartsForVersion($output, $script, $user, $scriptVersion);

        $aiMessage->setMetadata(['scriptVersionUuid' => $scriptVersion->getUuid()]);
    }

    private function processImproveHook(string $output, Chat $chat): void
    {
        $cleanOutput = $this->stripMarkdownCodeFences($output);
        $decoded = json_decode($cleanOutput, true);

        $suggestions = [];
        if ($decoded !== null && isset($decoded['suggestions']) && is_array($decoded['suggestions'])) {
            $suggestions = $decoded['suggestions'];
        }

        $aiMessage = $this->createAiMessage($chat, "Voici 3 suggestions d'accroche pour ton script.");
        $aiMessage->setSuggestedAnswers($suggestions);
    }

    private function processAnalyzeScript(string $output, Chat $chat): void
    {
        $this->createAiMessage($chat, $output);
    }

    private function processFreeChat(string $output, Chat $chat, Script $script, User $user): void
    {
        $cleanOutput = $this->stripMarkdownCodeFences($output);
        $decoded = json_decode($cleanOutput, true);

        if ($decoded !== null && isset($decoded['parts']) && is_array($decoded['parts'])) {
            $aiMessage = $this->createAiMessage($chat, "J'ai modifié le script selon ta demande.");

            $scriptVersion = new ScriptVersion();
            $scriptVersion
                ->setStatus(ScriptVersionStatus::Draft)
                ->setScript($script)
                ->setChat($chat)
                ->setMessage($aiMessage)
                ->setUser($user);
            $this->scriptVersionRepository->save($scriptVersion);

            $this->outputParserService->parseAndCreatePartsForVersion($output, $script, $user, $scriptVersion);

            $aiMessage->setMetadata(['scriptVersionUuid' => $scriptVersion->getUuid()]);
            return;
        }

        if ($decoded !== null && isset($decoded['suggestions']) && is_array($decoded['suggestions'])) {
            $aiMessage = $this->createAiMessage($chat, "Voici mes suggestions.");
            $aiMessage->setSuggestedAnswers($decoded['suggestions']);
            return;
        }

        $this->createAiMessage($chat, $output);
    }

    private function stripMarkdownCodeFences(string $output): string
    {
        $output = trim($output);

        if (preg_match('/^```(?:json)?\s*\n?(.*?)\n?\s*```$/s', $output, $match)) {
            return trim($match[1]);
        }

        return $output;
    }
}
