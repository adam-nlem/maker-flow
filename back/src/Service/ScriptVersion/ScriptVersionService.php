<?php

namespace App\Service\ScriptVersion;

use App\Entity\Chat;
use App\Entity\Enum\ScriptVersionStatus;
use App\Entity\Message;
use App\Entity\Script;
use App\Entity\ScriptHook;
use App\Entity\ScriptVersion;
use App\Entity\User;
use App\Repository\ScriptHookRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVersionRepository;
use Doctrine\ORM\EntityManagerInterface;

class ScriptVersionService
{
    public function __construct(
        private readonly ScriptHookRepository $hookRepository,
        private readonly ScriptTextRepository $textRepository,
        private readonly ScriptVersionRepository $scriptVersionRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    public function acceptVersion(ScriptVersion $scriptVersion): void
    {
        $this->entityManager->beginTransaction();

        try {
            $script = $scriptVersion->getScript();

            if ($this->hookRepository->existsByScriptVersion($scriptVersion)) {
                $this->hookRepository->deleteMainPartsByScript($script);
                $this->hookRepository->promoteVersionPartsToMain($scriptVersion);
            }

            if ($this->textRepository->existsByScriptVersion($scriptVersion)) {
                $this->textRepository->deleteMainPartsByScript($script);
                $this->textRepository->promoteVersionPartsToMain($scriptVersion);
            }

            $scriptVersion->setStatus(ScriptVersionStatus::Accepted);
            $this->entityManager->flush();
            $this->entityManager->commit();
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }

    public function rejectVersion(ScriptVersion $scriptVersion): void
    {
        $scriptVersion->setStatus(ScriptVersionStatus::Rejected);
        $this->scriptVersionRepository->save($scriptVersion, true);
    }

    public function applyHookSuggestion(Chat $chat, Message $aiMessage, string $hookContent, User $user): ScriptVersion
    {
        $script = $chat->getScript();

        $this->entityManager->beginTransaction();

        try {
            $scriptVersion = new ScriptVersion();
            $scriptVersion
                ->setStatus(ScriptVersionStatus::Accepted)
                ->setScript($script)
                ->setChat($chat)
                ->setMessage($aiMessage)
                ->setUser($user);
            $this->scriptVersionRepository->save($scriptVersion);

            $hook = new ScriptHook();
            $hook
                ->setContent($hookContent)
                ->setPosition(0)
                ->setScript($script)
                ->setUser($user)
                ->setScriptVersion($scriptVersion);
            $this->hookRepository->save($hook);

            $this->hookRepository->deleteMainPartsByScript($script);
            $this->hookRepository->promoteVersionPartsToMain($scriptVersion);

            $this->entityManager->flush();
            $this->entityManager->commit();

            return $scriptVersion;
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }
}
