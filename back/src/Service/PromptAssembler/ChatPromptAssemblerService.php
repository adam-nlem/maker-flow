<?php

namespace App\Service\PromptAssembler;

use App\Entity\Chat;
use App\Entity\Enum\MessageType;
use App\Entity\Message;
use App\Entity\Script;
use App\Repository\MessageRepository;
use App\Repository\ScriptPartRepository;
use App\Repository\ScriptRepository;

class ChatPromptAssemblerService
{
    public function __construct(
        private readonly MessageRepository $messageRepository,
        private readonly ScriptPartRepository $scriptPartRepository,
        private readonly ScriptRepository $scriptRepository,
    ) {}

    public function assemble(
        Chat $chat,
        Message $userMessage,
    ): string {
        $blocks = [];

        $blocks[] = $this->buildSystemRoleBlock();

        $referenceBlock = $this->buildReferenceScriptBlock($userMessage, $chat);
        if ($referenceBlock !== null) {
            $blocks[] = $referenceBlock;
        }

        $currentScriptBlock = $this->buildCurrentScriptBlock($chat->getScript());
        if ($currentScriptBlock !== null) {
            $blocks[] = $currentScriptBlock;
        }

        $historyBlock = $this->buildConversationHistoryBlock($chat, $userMessage);
        if ($historyBlock !== null) {
            $blocks[] = $historyBlock;
        }

        $blocks[] = "Message de l'utilisateur :\n{$userMessage->getContent()}";
        $blocks[] = $this->buildOutputFormatBlock();

        return implode("\n\n", array_filter($blocks));
    }

    private function buildSystemRoleBlock(): string
    {
        return <<<PROMPT
Tu es un assistant expert en création de scripts vidéo pour les créateurs de contenu.
Tu réponds toujours en français.

Le script est composé de "parts" (lignes) ordonnées. Chaque part a un identifiant unique (uuid), un type (hook, text, dialogue, shot, voice_over, call_to_action, retention_cue, chapter) et un contenu.

Quand l'utilisateur te demande de modifier le script, tu peux proposer une ou plusieurs opérations sur les parts existantes :
- "rewrite" : reformuler le contenu d'une part existante
- "insert" : insérer une nouvelle part à une position donnée
- "delete" : supprimer une part existante
- "reorder" : déplacer une part à une nouvelle position

Tes propositions ne sont pas appliquées immédiatement : l'utilisateur les acceptera ou les refusera une par une.

Si tu as besoin de plus d'informations avant de proposer des modifications (par exemple sur l'audience, l'objectif, la durée), pose des questions naturelles en texte libre dans `replyText` et laisse `suggestions` vide.
PROMPT;
    }

    private function buildReferenceScriptBlock(Message $userMessage, Chat $chat): ?string
    {
        $metadata = $userMessage->getMetadata();
        $referenceScriptUuid = $metadata['referenceScriptUuid'] ?? null;

        if ($referenceScriptUuid === null) {
            return null;
        }

        $referenceScript = $chat->getUser() !== null
            ? $this->scriptRepository->getAccessibleByUuidForUser($referenceScriptUuid, $chat->getUser())
            : null;

        if ($referenceScript === null) {
            return null;
        }

        $content = $this->serializeScriptParts($referenceScript, withUuids: false);

        if ($content === '') {
            return null;
        }

        return "Script de référence :\n{$content}";
    }

    private function buildCurrentScriptBlock(Script $script): ?string
    {
        $content = $this->serializeScriptParts($script, withUuids: true);

        if ($content === '') {
            return "Script actuel : (vide)";
        }

        return "Script actuel (parts ordonnées) :\n{$content}";
    }

    private function serializeScriptParts(Script $script, bool $withUuids): string
    {
        $parts = $this->scriptPartRepository->getByScriptOrderedByPosition($script);

        $lines = [];
        foreach ($parts as $part) {
            $type = $part->getType()?->value ?? 'text';
            if ($withUuids) {
                $lines[] = "[position={$part->getPosition()}][type={$type}][uuid={$part->getUuid()}] : {$part->getContent()}";
            } else {
                $lines[] = "[{$type}] : {$part->getContent()}";
            }
        }

        return implode("\n", $lines);
    }

    private function buildConversationHistoryBlock(Chat $chat, Message $currentMessage): ?string
    {
        $messages = $this->messageRepository->getAllByChat($chat);

        $lines = [];
        foreach ($messages as $message) {
            if ($message->getId() === $currentMessage->getId()) {
                continue;
            }

            $role = match ($message->getType()) {
                MessageType::User => 'Utilisateur',
                MessageType::Ai => 'Assistant',
                MessageType::System => 'Système',
                default => 'Système',
            };

            $lines[] = "[{$role}] : {$message->getContent()}";
        }

        if (count($lines) === 0) {
            return null;
        }

        return "Historique de la conversation :\n" . implode("\n", $lines);
    }

    private function buildOutputFormatBlock(): string
    {
        $lines = [];
        $lines[] = "Réponds UNIQUEMENT en JSON valide, sans blocs de code markdown ni texte autour. Structure :";
        $lines[] = '{';
        $lines[] = '  "replyText": "Ta réponse conversationnelle à l\'utilisateur (en français)",';
        $lines[] = '  "suggestions": [';
        $lines[] = '    { "action": "rewrite", "scriptPartUuid": "...", "proposedContent": "Nouveau contenu" },';
        $lines[] = '    { "action": "insert", "proposedPosition": 2, "proposedType": "text", "proposedContent": "Nouvelle ligne" },';
        $lines[] = '    { "action": "delete", "scriptPartUuid": "..." },';
        $lines[] = '    { "action": "reorder", "scriptPartUuid": "...", "proposedPosition": 0 }';
        $lines[] = '  ]';
        $lines[] = '}';
        $lines[] = '';
        $lines[] = "Règles :";
        $lines[] = "- `replyText` est obligatoire (peut être court).";
        $lines[] = "- `suggestions` est obligatoire mais peut être un tableau vide.";
        $lines[] = "- `scriptPartUuid` doit être un UUID exact d'une part existante du script actuel.";
        $lines[] = "- `proposedType` doit être l'une des valeurs : hook, text, dialogue, shot, voice_over, call_to_action, retention_cue, chapter.";
        $lines[] = "- `proposedPosition` est un entier (0 = début).";
        $lines[] = "- N'ajoute aucun préambule. Commence directement par `{`.";

        return implode("\n", $lines);
    }
}
