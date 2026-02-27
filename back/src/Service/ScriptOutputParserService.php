<?php

namespace App\Service;

use App\Entity\Enum\ChapterType;
use App\Entity\Enum\ShotType;
use App\Entity\Enum\Tone;
use App\Entity\Script;
use App\Entity\ScriptChapter;
use App\Entity\ScriptShot;
use App\Entity\ScriptText;
use App\Entity\ScriptVoiceOver;
use App\Entity\User;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\DTO\ScriptOutputMetadataDTO;
use App\Repository\ScriptVoiceOverRepository;

class ScriptOutputParserService
{
    public function __construct(
        private readonly ScriptChapterRepository $chapterRepository,
        private readonly ScriptVoiceOverRepository $voiceOverRepository,
        private readonly ScriptDialogueRepository $dialogueRepository,
        private readonly ScriptShotRepository $shotRepository,
        private readonly ScriptTextRepository $textRepository,
    ) {}

    public function parseAndCreateParts(string $output, Script $script, User $user, int $startPosition): ScriptOutputMetadataDTO
    {
        $position = $startPosition;
        $remaining = $output;
        $title = null;
        $hook = null;

        while ($remaining !== '') {
            $remaining = trim($remaining);
            if ($remaining === '') {
                break;
            }

            // Try to match [TITLE]...[/TITLE]
            if (preg_match('/^\[TITLE\](.*?)\[\/TITLE\]/s', $remaining, $match)) {
                $content = trim($match[1]);
                if ($content !== '') {
                    $title = $content;
                }
                $remaining = substr($remaining, strlen($match[0]));
                continue;
            }

            // Try to match [HOOK]...[/HOOK]
            if (preg_match('/^\[HOOK\](.*?)\[\/HOOK\]/s', $remaining, $match)) {
                $content = trim($match[1]);
                if ($content !== '') {
                    $hook = $content;
                }
                $remaining = substr($remaining, strlen($match[0]));
                continue;
            }

            // Try to match [CHAPTER]Title[/CHAPTER]
            if (preg_match('/^\[CHAPTER\](.*?)\[\/CHAPTER\](.*?)(?=\[TITLE\]|\[HOOK\]|\[CHAPTER\]|\[VOICE_OVER\]|\[B-ROLL:|$)/s', $remaining, $match)) {
                $chapterTitle = trim($match[1]);
                $description = trim($match[2]);

                $chapter = new ScriptChapter();
                $chapter
                    ->setScript($script)
                    ->setUser($user)
                    ->setTitle($chapterTitle)
                    ->setDescription($description !== '' ? $description : null)
                    ->setChapterType(ChapterType::OffScreen)
                    ->setPosition($position++);
                $this->chapterRepository->save($chapter);

                $remaining = substr($remaining, strlen($match[0]));
                continue;
            }

            // Try to match [VOICE_OVER]...[/VOICE_OVER]
            if (preg_match('/^\[VOICE_OVER\](.*?)\[\/VOICE_OVER\]/s', $remaining, $match)) {
                $content = trim($match[1]);

                if ($content !== '') {
                    $voiceOver = new ScriptVoiceOver();
                    $voiceOver
                        ->setScript($script)
                        ->setUser($user)
                        ->setContent($content)
                        ->setTone(Tone::Neutral)
                        ->setPosition($position++);
                    $this->voiceOverRepository->save($voiceOver);
                }

                $remaining = substr($remaining, strlen($match[0]));
                continue;
            }

            // Try to match [B-ROLL: description]
            if (preg_match('/^\[B-ROLL:\s*(.*?)\]/s', $remaining, $match)) {
                $description = trim($match[1]);

                if ($description !== '') {
                    $shot = new ScriptShot();
                    $shot
                        ->setScript($script)
                        ->setUser($user)
                        ->setContent($description)
                        ->setShotType(ShotType::BRoll)
                        ->setPosition($position++);
                    $this->shotRepository->save($shot);
                }

                $remaining = substr($remaining, strlen($match[0]));
                continue;
            }

            // Capture text until the next marker or end
            if (preg_match('/^(.*?)(?=\[TITLE\]|\[HOOK\]|\[CHAPTER\]|\[VOICE_OVER\]|\[B-ROLL:)/s', $remaining, $match) && $match[1] !== '') {
                $content = trim($match[1]);

                if ($content !== '') {
                    $text = new ScriptText();
                    $text
                        ->setScript($script)
                        ->setUser($user)
                        ->setContent($content)
                        ->setPosition($position++);
                    $this->textRepository->save($text);
                }

                $remaining = substr($remaining, strlen($match[1]));
                continue;
            }

            // No marker found — rest is plain text
            $content = trim($remaining);
            if ($content !== '') {
                $text = new ScriptText();
                $text
                    ->setScript($script)
                    ->setUser($user)
                    ->setContent($content)
                    ->setPosition($position++);
                $this->textRepository->save($text);
            }
            break;
        }

        return new ScriptOutputMetadataDTO($title, $hook);
    }

    public function getMaxPositionForScript(Script $script): int
    {
        return max(
            $this->chapterRepository->getMaxPositionByScript($script),
            $this->voiceOverRepository->getMaxPositionByScript($script),
            $this->dialogueRepository->getMaxPositionByScript($script),
            $this->shotRepository->getMaxPositionByScript($script),
            $this->textRepository->getMaxPositionByScript($script),
        );
    }
}
