<?php

namespace App\Service\ChatGeneration;

use App\Entity\Chat;
use App\Entity\Enum\MessageType;
use App\Entity\Enum\ScriptPartSuggestionAction;
use App\Entity\Enum\ScriptPartType;
use App\Entity\Message;
use App\Entity\Script;
use App\Entity\ScriptPart;
use App\Entity\ScriptPartSuggestion;
use App\Entity\User;
use App\Repository\MessageRepository;
use App\Repository\ScriptPartRepository;
use App\Repository\ScriptPartSuggestionRepository;

class ChatResponseProcessorService
{
    public function __construct(
        private readonly MessageRepository $messageRepository,
        private readonly ScriptPartRepository $scriptPartRepository,
        private readonly ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
    ) {}

    public function processOutput(string $output, Chat $chat, Script $script, User $user): void
    {
        $cleanOutput = $this->stripMarkdownCodeFences($output);
        $decoded = json_decode($cleanOutput, true);

        $replyText = is_array($decoded) && isset($decoded['replyText']) && is_string($decoded['replyText'])
            ? $decoded['replyText']
            : $output;

        $aiMessage = $this->createAiMessage($chat, $replyText);

        $rawSuggestions = is_array($decoded) && isset($decoded['suggestions']) && is_array($decoded['suggestions'])
            ? $decoded['suggestions']
            : [];

        $createdUuids = [];
        foreach ($rawSuggestions as $rawSuggestion) {
            $suggestion = $this->createSuggestion($rawSuggestion, $aiMessage, $script, $user);
            if ($suggestion !== null) {
                $createdUuids[] = $suggestion->getUuid();
            }
        }

        $aiMessage->setMetadata([
            'suggestionUuids' => $createdUuids,
        ]);
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

    private function createSuggestion(mixed $raw, Message $aiMessage, Script $script, User $user): ?ScriptPartSuggestion
    {
        if (!is_array($raw) || !isset($raw['action']) || !is_string($raw['action'])) {
            return null;
        }

        $action = ScriptPartSuggestionAction::tryFrom($raw['action']);
        if ($action === null) {
            return null;
        }

        $suggestion = new ScriptPartSuggestion();
        $suggestion
            ->setScript($script)
            ->setUser($user)
            ->setMessage($aiMessage)
            ->setAction($action);

        $partUuid = isset($raw['scriptPartUuid']) && is_string($raw['scriptPartUuid']) ? $raw['scriptPartUuid'] : null;
        $part = $partUuid !== null ? $this->scriptPartRepository->getAccessibleByUuidForUser($partUuid, $user) : null;

        $proposedContent = isset($raw['proposedContent']) && is_string($raw['proposedContent']) ? $raw['proposedContent'] : null;
        $proposedTypeRaw = isset($raw['proposedType']) && is_string($raw['proposedType']) ? $raw['proposedType'] : null;
        $proposedType = $proposedTypeRaw !== null ? ScriptPartType::tryFrom($proposedTypeRaw) : null;
        $proposedPosition = isset($raw['proposedPosition']) ? (int) $raw['proposedPosition'] : null;

        switch ($action) {
            case ScriptPartSuggestionAction::Rewrite:
                if ($part === null || $proposedContent === null) {
                    return null;
                }
                $suggestion
                    ->setScriptPart($part)
                    ->setOriginalContent($part->getContent())
                    ->setProposedContent($proposedContent);
                break;

            case ScriptPartSuggestionAction::Insert:
                if ($proposedContent === null) {
                    return null;
                }
                $suggestion
                    ->setProposedContent($proposedContent)
                    ->setProposedType($proposedType ?? ScriptPartType::Text)
                    ->setProposedPosition($proposedPosition);
                break;

            case ScriptPartSuggestionAction::Delete:
                if ($part === null) {
                    return null;
                }
                $suggestion
                    ->setScriptPart($part)
                    ->setOriginalContent($part->getContent());
                break;

            case ScriptPartSuggestionAction::Reorder:
                if ($part === null || $proposedPosition === null) {
                    return null;
                }
                $suggestion
                    ->setScriptPart($part)
                    ->setProposedPosition($proposedPosition);
                break;
        }

        $this->scriptPartSuggestionRepository->save($suggestion);

        return $suggestion;
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
