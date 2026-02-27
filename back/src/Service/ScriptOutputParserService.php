<?php

namespace App\Service;

use App\DTO\ScriptOutputDTO;
use App\Entity\Enum\CallToActionType;
use App\Entity\Enum\ChapterType;
use App\Entity\Enum\RetentionCueType;
use App\Entity\Enum\ShotType;
use App\Entity\Enum\Tone;
use App\Entity\Script;
use App\Entity\ScriptCallToAction;
use App\Entity\ScriptChapter;
use App\Entity\ScriptRetentionCue;
use App\Entity\ScriptShot;
use App\Entity\ScriptText;
use App\Entity\ScriptVoiceOver;
use App\Entity\User;
use App\Repository\ScriptCallToActionRepository;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
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
    ) {}

    public function parseAndCreateParts(string $output, Script $script, User $user, int $startPosition): ScriptOutputDTO
    {
        $cleanOutput = $this->stripMarkdownCodeFences($output);
        $decoded = json_decode($cleanOutput, true);

        if ($decoded === null) {
            throw new \RuntimeException('Failed to decode AI output as JSON: ' . json_last_error_msg());
        }

        $dto = ScriptOutputDTO::fromArray($decoded);
        $position = $startPosition;

        foreach ($dto->getParts() as $part) {
            $content = trim($part->getContent() ?? '');

            match ($part->getType()) {
                'chapter' => $this->createChapter($part->getTitle(), $part->getDescription(), $script, $user, $position++),
                'voice_over' => $content !== '' ? $this->createVoiceOver($content, $script, $user, $position++) : null,
                'shot' => $content !== '' ? $this->createShot($content, $script, $user, $position++) : null,
                'call_to_action' => $content !== '' ? $this->createCallToAction($content, $part->getCallToActionType(), $script, $user, $position++) : null,
                'retention_cue' => $content !== '' ? $this->createRetentionCue($content, $part->getRetentionCueType(), $script, $user, $position++) : null,
                'text' => $content !== '' ? $this->createText($content, $script, $user, $position++) : null,
                default => null,
            };
        }

        return $dto;
    }

    public function getMaxPositionForScript(Script $script): int
    {
        return max(
            $this->chapterRepository->getMaxPositionByScript($script),
            $this->voiceOverRepository->getMaxPositionByScript($script),
            $this->dialogueRepository->getMaxPositionByScript($script),
            $this->shotRepository->getMaxPositionByScript($script),
            $this->textRepository->getMaxPositionByScript($script),
            $this->callToActionRepository->getMaxPositionByScript($script),
            $this->retentionCueRepository->getMaxPositionByScript($script),
        );
    }

    private function stripMarkdownCodeFences(string $output): string
    {
        $output = trim($output);

        if (preg_match('/^```(?:json)?\s*\n?(.*?)\n?\s*```$/s', $output, $match)) {
            return trim($match[1]);
        }

        return $output;
    }

    private function createChapter(?string $title, ?string $description, Script $script, User $user, int $position): void
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
            ->setPosition($position);
        $this->chapterRepository->save($chapter);
    }

    private function createVoiceOver(string $content, Script $script, User $user, int $position): void
    {
        $voiceOver = new ScriptVoiceOver();
        $voiceOver
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setTone(Tone::Neutral)
            ->setPosition($position);
        $this->voiceOverRepository->save($voiceOver);
    }

    private function createShot(string $content, Script $script, User $user, int $position): void
    {
        $shot = new ScriptShot();
        $shot
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setShotType(ShotType::BRoll)
            ->setPosition($position);
        $this->shotRepository->save($shot);
    }

    private function createCallToAction(string $content, ?string $callToActionType, Script $script, User $user, int $position): void
    {
        $callToAction = new ScriptCallToAction();
        $callToAction
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setCallToActionType(CallToActionType::tryFrom($callToActionType ?? '') ?? CallToActionType::Custom)
            ->setPosition($position);
        $this->callToActionRepository->save($callToAction);
    }

    private function createRetentionCue(string $content, ?string $retentionCueType, Script $script, User $user, int $position): void
    {
        $retentionCue = new ScriptRetentionCue();
        $retentionCue
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setRetentionCueType(RetentionCueType::tryFrom($retentionCueType ?? '') ?? RetentionCueType::Question)
            ->setPosition($position);
        $this->retentionCueRepository->save($retentionCue);
    }

    private function createText(string $content, Script $script, User $user, int $position): void
    {
        $text = new ScriptText();
        $text
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setPosition($position);
        $this->textRepository->save($text);
    }
}
