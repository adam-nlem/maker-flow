<?php

namespace App\Service\PromptAssembler;

use App\Entity\Chat;
use App\Entity\CreatorProfile;
use App\Entity\Enum\ChatAction;
use App\Entity\Enum\MessageType;
use App\Entity\Message;
use App\Entity\Script;
use App\Repository\MessageRepository;
use App\Repository\ScriptHookRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptTextRepository;

class ChatPromptAssemblerService
{
    public function __construct(
        private readonly MessageRepository $messageRepository,
        private readonly ScriptHookRepository $hookRepository,
        private readonly ScriptTextRepository $textRepository,
        private readonly ScriptRepository $scriptRepository,
    ) {}

    public function assemble(
        Chat $chat,
        Message $userMessage,
        ChatAction $chatAction,
        ?CreatorProfile $creatorProfile,
    ): string {
        $blocks = [];

        $blocks[] = $this->buildSystemRoleBlock();

        if ($creatorProfile !== null) {
            $profileBlock = CreatorProfilePromptHelper::buildBlock($creatorProfile);
            if ($profileBlock !== '') {
                $blocks[] = $profileBlock;
            }
        }

        $referenceBlock = $this->buildReferenceScriptBlock($userMessage, $chat);
        if ($referenceBlock !== null) {
            $blocks[] = $referenceBlock;
        }

        if ($chatAction !== ChatAction::GenerateScript) {
            $currentScriptBlock = $this->buildCurrentScriptBlock($chat->getScript(), $chat->getUser());
            if ($currentScriptBlock !== null) {
                $blocks[] = $currentScriptBlock;
            }
        }

        if ($chatAction === ChatAction::GenerateScript) {
            $briefBlock = $this->buildBriefDataBlock($userMessage);
            if ($briefBlock !== null) {
                $blocks[] = $briefBlock;
            }
        }

        $historyBlock = $this->buildConversationHistoryBlock($chat, $userMessage);
        if ($historyBlock !== null) {
            $blocks[] = $historyBlock;
        }

        $blocks[] = "Message de l'utilisateur :\n{$userMessage->getContent()}";
        $blocks[] = $this->buildOutputFormatBlock($chatAction);

        return implode("\n\n", array_filter($blocks));
    }

    private function buildSystemRoleBlock(): string
    {
        return "Tu es un assistant expert en création de scripts vidéo pour les créateurs de contenu.\nTu réponds toujours en français.";
    }

    private function buildReferenceScriptBlock(Message $userMessage, Chat $chat): ?string
    {
        $metadata = $userMessage->getMetadata();
        $referenceScriptUuid = $metadata['referenceScriptUuid'] ?? null;

        if ($referenceScriptUuid === null) {
            return null;
        }

        $referenceScript = $this->scriptRepository->getByUuidAndUser($referenceScriptUuid, $chat->getUser());

        if ($referenceScript === null) {
            return null;
        }

        $content = $this->serializeScriptParts($referenceScript, $chat->getUser());

        if ($content === '') {
            return null;
        }

        return "Script de référence :\n{$content}";
    }

    private function buildCurrentScriptBlock(Script $script, $user): ?string
    {
        $content = $this->serializeScriptParts($script, $user);

        if ($content === '') {
            return null;
        }

        return "Contenu actuel du script :\n{$content}";
    }

    private function serializeScriptParts(Script $script, $user): string
    {
        $lines = [];

        $hooks = $this->hookRepository->getByScriptAndUserMainParts($script, $user);
        foreach ($hooks as $hook) {
            $lines[] = "[Hook] : {$hook->getContent()}";
        }

        $texts = $this->textRepository->getByScriptAndUserMainParts($script, $user);
        foreach ($texts as $text) {
            $lines[] = "[Texte] : {$text->getContent()}";
        }

        return implode("\n", $lines);
    }

    private function buildBriefDataBlock(Message $userMessage): ?string
    {
        $metadata = $userMessage->getMetadata();

        if ($metadata === null) {
            return null;
        }

        $lines = [];

        if (isset($metadata['audience'])) {
            $lines[] = "Audience cible : {$metadata['audience']}";
        }

        if (isset($metadata['goal'])) {
            $lines[] = "Objectif : {$metadata['goal']}";
        }

        if (isset($metadata['duration'])) {
            $lines[] = "Durée cible : {$metadata['duration']}";
        }

        if (isset($metadata['keyPoints']) && $metadata['keyPoints'] !== '') {
            $lines[] = "Points clés à couvrir :\n{$metadata['keyPoints']}";
        }

        if (count($lines) === 0) {
            return null;
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

    private function buildOutputFormatBlock(ChatAction $chatAction): string
    {
        return match ($chatAction) {
            ChatAction::GenerateScript => $this->buildGenerateScriptFormatBlock(),
            ChatAction::ImproveHook => $this->buildImproveHookFormatBlock(),
            ChatAction::AnalyzeScript => "Réponds en texte libre en français. Pas de JSON.",
            ChatAction::FreeChat => $this->buildFreeChatFormatBlock(),
        };
    }

    private function buildGenerateScriptFormatBlock(): string
    {
        $lines = [];
        $lines[] = 'Formate ta sortie UNIQUEMENT en JSON valide, sans blocs de code markdown ni texte autour. Utilise cette structure exacte :';
        $lines[] = '{';
        $lines[] = '  "parts": [';
        $lines[] = '    { "type": "hook", "content": "Accroche du script" },';
        $lines[] = '    { "type": "text", "content": "Contenu du script" }';
        $lines[] = '  ]';
        $lines[] = '}';
        $lines[] = "L'ordre des éléments dans le tableau \"parts\" définit l'ordre du script. Tu peux inclure plusieurs éléments de type \"text\".";
        $lines[] = "Écris maintenant le script en français. N'ajoute pas de préambule — commence directement par le JSON.";

        return implode("\n", $lines);
    }

    private function buildImproveHookFormatBlock(): string
    {
        $lines = [];
        $lines[] = "Propose 3 alternatives d'accroche pour ce script.";
        $lines[] = 'Formate ta sortie UNIQUEMENT en JSON valide, sans blocs de code markdown ni texte autour :';
        $lines[] = '{ "suggestions": ["accroche 1", "accroche 2", "accroche 3"] }';
        $lines[] = "N'ajoute pas de préambule — commence directement par le JSON.";

        return implode("\n", $lines);
    }

    private function buildFreeChatFormatBlock(): string
    {
        $lines = [];
        $lines[] = "Si l'utilisateur te demande de modifier, écrire ou améliorer le script, réponds en JSON valide :";
        $lines[] = '{ "parts": [{ "type": "hook", "content": "..." }, { "type": "text", "content": "..." }] }';
        $lines[] = 'Inclus uniquement les parties que tu modifies (hook et/ou text).';
        $lines[] = "Si l'utilisateur pose des questions ou demande une analyse, réponds en texte libre en français.";

        return implode("\n", $lines);
    }
}
