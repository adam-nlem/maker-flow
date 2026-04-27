<?php

namespace App\Service\ScriptPartSuggestion;

use App\Entity\Enum\ScriptPartSuggestionAction;
use App\Entity\Enum\ScriptPartSuggestionStatus;
use App\Entity\Enum\ScriptPartType;
use App\Entity\ScriptPartSuggestion;
use App\Exception\ScriptPartSuggestion\ScriptPartSuggestionNotPendingException;
use App\Repository\ScriptPartRepository;
use App\Repository\ScriptPartSuggestionRepository;
use App\Service\ScriptPart\ScriptPartService;

class ScriptPartSuggestionService
{
    public function __construct(
        private readonly ScriptPartRepository $scriptPartRepository,
        private readonly ScriptPartSuggestionRepository $scriptPartSuggestionRepository,
        private readonly ScriptPartService $scriptPartService,
    ) {}

    public function accept(ScriptPartSuggestion $suggestion): void
    {
        $this->ensurePending($suggestion);

        match ($suggestion->getAction()) {
            ScriptPartSuggestionAction::Rewrite => $this->applyRewrite($suggestion),
            ScriptPartSuggestionAction::Insert => $this->applyInsert($suggestion),
            ScriptPartSuggestionAction::Delete => $this->applyDelete($suggestion),
            ScriptPartSuggestionAction::Reorder => $this->applyReorder($suggestion),
        };

        $suggestion->setStatus(ScriptPartSuggestionStatus::Accepted);
        $this->scriptPartSuggestionRepository->save($suggestion, true);
    }

    public function reject(ScriptPartSuggestion $suggestion): void
    {
        $this->ensurePending($suggestion);

        $suggestion->setStatus(ScriptPartSuggestionStatus::Rejected);
        $this->scriptPartSuggestionRepository->save($suggestion, true);
    }

    private function ensurePending(ScriptPartSuggestion $suggestion): void
    {
        if ($suggestion->getStatus() !== ScriptPartSuggestionStatus::Pending) {
            throw new ScriptPartSuggestionNotPendingException();
        }
    }

    private function applyRewrite(ScriptPartSuggestion $suggestion): void
    {
        $part = $suggestion->getScriptPart();
        if ($part === null) {
            return;
        }

        $this->scriptPartService->update(
            $part,
            $suggestion->getProposedContent(),
            null,
            null,
        );
    }

    private function applyInsert(ScriptPartSuggestion $suggestion): void
    {
        $script = $suggestion->getScript();
        $user = $suggestion->getUser();
        if ($script === null || $user === null) {
            return;
        }

        $this->scriptPartService->create(
            $script,
            $user,
            $suggestion->getProposedContent() ?? '',
            $suggestion->getProposedType() ?? ScriptPartType::Text,
            $suggestion->getProposedPosition(),
        );
    }

    private function applyDelete(ScriptPartSuggestion $suggestion): void
    {
        $part = $suggestion->getScriptPart();
        if ($part === null) {
            return;
        }

        // Auto-reject other pending suggestions on this part — they no longer make sense.
        $otherPending = $this->scriptPartSuggestionRepository->getPendingByScriptPart($part);
        foreach ($otherPending as $other) {
            if ($other->getId() === $suggestion->getId()) {
                continue;
            }
            $other->setStatus(ScriptPartSuggestionStatus::Rejected);
            $this->scriptPartSuggestionRepository->save($other);
        }

        $this->scriptPartService->delete($part);
    }

    private function applyReorder(ScriptPartSuggestion $suggestion): void
    {
        $part = $suggestion->getScriptPart();
        if ($part === null || $suggestion->getProposedPosition() === null) {
            return;
        }

        $this->scriptPartService->update(
            $part,
            null,
            null,
            $suggestion->getProposedPosition(),
        );
    }
}
