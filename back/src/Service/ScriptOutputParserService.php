<?php

namespace App\Service;

use App\DTO\ScriptOutputDTO;
use App\Entity\Enum\CallToActionType;
use App\Entity\Enum\ChapterType;
use App\Entity\Enum\RetentionCueType;
use App\Entity\Enum\ScriptPartType;
use App\Entity\Enum\ShotType;
use App\Entity\Enum\Tone;
use App\Entity\Script;
use App\Entity\ScriptCallToAction;
use App\Entity\ScriptChapter;
use App\Entity\ScriptGeneration;
use App\Entity\ScriptRetentionCue;
use App\Entity\ScriptShot;
use App\Entity\ScriptHook;
use App\Entity\ScriptText;
use App\Entity\ScriptVoiceOver;
use App\Entity\User;
use App\Repository\ScriptCallToActionRepository;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptHookRepository;
use App\Repository\ScriptRetentionCueRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;

class ScriptOutputParserService
{
    public function __construct(
        private readonly ScriptChapterRepository $chapterRepository,
        private readonly ScriptVoiceOverRepository $voiceOverRepository,
        private readonly ScriptDialogueRepository $dialogueRepository,
        private readonly ScriptShotRepository $shotRepository,
        private readonly ScriptTextRepository $textRepository,
        private readonly ScriptCallToActionRepository $callToActionRepository,
        private readonly ScriptRetentionCueRepository $retentionCueRepository,
        private readonly ScriptHookRepository $hookRepository,
    ) {}

    public function parseAndCreateParts(string $output, Script $script, User $user, ScriptGeneration $generation): ScriptOutputDTO
    {
        $cleanOutput = $this->stripMarkdownCodeFences($output);
        $decoded = json_decode($cleanOutput, true);

        if ($decoded === null) {
            throw new \RuntimeException('Failed to decode AI output as JSON: ' . json_last_error_msg());
        }

        $dto = ScriptOutputDTO::fromArray($decoded);
        $position = 0;

        foreach ($dto->getParts() as $part) {
            $content = trim($part->getContent() ?? '');

            match ($part->getType()) {
                ScriptPartType::Chapter->value => $this->createChapter($part->getTitle(), $part->getDescription(), $script, $user, $position++, $generation),
                ScriptPartType::VoiceOver->value => $content !== '' ? $this->createVoiceOver($content, $part->getTone(), $script, $user, $position++, $generation) : null,
                ScriptPartType::Shot->value => $content !== '' ? $this->createShot($content, $script, $user, $position++, $generation) : null,
                ScriptPartType::CallToAction->value => $content !== '' ? $this->createCallToAction($content, $part->getCallToActionType(), $script, $user, $position++, $generation) : null,
                ScriptPartType::RetentionCue->value => $content !== '' ? $this->createRetentionCue($content, $part->getRetentionCueType(), $script, $user, $position++, $generation) : null,
                ScriptPartType::Text->value => $content !== '' ? $this->createText($content, $script, $user, $position++, $generation) : null,
                ScriptPartType::Hook->value => $content !== '' ? $this->createHook($content, $script, $user, 0, $generation) : null,
                default => null,
            };
        }

        return $dto;
    }

    private function stripMarkdownCodeFences(string $output): string
    {
        $output = trim($output);

        if (preg_match('/^```(?:json)?\s*\n?(.*?)\n?\s*```$/s', $output, $match)) {
            return trim($match[1]);
        }

        return $output;
    }

    private function createChapter(?string $title, ?string $description, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $chapterTitle = trim($title ?? '');
        if ($chapterTitle === '') {
            return;
        }

        $chapter = new ScriptChapter();
        $chapter
            ->setScript($script)
            ->setUser($user)
            ->setTitle($chapterTitle)
            ->setDescription($description !== null && trim($description) !== '' ? trim($description) : null)
            ->setChapterType(ChapterType::OffScreen)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->chapterRepository->save($chapter);
    }

    private function createVoiceOver(string $content, ?string $tone, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $voiceOver = new ScriptVoiceOver();
        $voiceOver
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setTone(Tone::tryFrom($tone ?? '') ?? Tone::Neutral)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->voiceOverRepository->save($voiceOver);
    }

    private function createShot(string $content, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $shot = new ScriptShot();
        $shot
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setShotType(ShotType::BRoll)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->shotRepository->save($shot);
    }

    private function createCallToAction(string $content, ?string $callToActionType, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $callToAction = new ScriptCallToAction();
        $callToAction
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setCallToActionType(CallToActionType::tryFrom($callToActionType ?? '') ?? CallToActionType::Custom)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->callToActionRepository->save($callToAction);
    }

    private function createRetentionCue(string $content, ?string $retentionCueType, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $retentionCue = new ScriptRetentionCue();
        $retentionCue
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setRetentionCueType(RetentionCueType::tryFrom($retentionCueType ?? '') ?? RetentionCueType::Question)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->retentionCueRepository->save($retentionCue);
    }

    private function createText(string $content, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $text = new ScriptText();
        $text
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->textRepository->save($text);
    }

    private function createHook(string $content, Script $script, User $user, int $position, ScriptGeneration $generation): void
    {
        $hook = new ScriptHook();
        $hook
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setPosition($position)
            ->setScriptGeneration($generation);
        $this->hookRepository->save($hook);
    }
}
