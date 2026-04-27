<?php

namespace App\Service\ScriptPart;

use App\Entity\Enum\ScriptPartType;
use App\Entity\Script;
use App\Entity\ScriptPart;
use App\Entity\User;
use App\Repository\ScriptPartRepository;

class ScriptPartService
{
    public function __construct(
        private readonly ScriptPartRepository $scriptPartRepository,
    ) {}

    public function create(Script $script, User $user, string $content, ScriptPartType $type, ?int $position = null): ScriptPart
    {
        if ($position === null) {
            $position = $this->scriptPartRepository->getMaxPositionByScript($script) + 1;
        } else {
            $this->scriptPartRepository->shiftPositionsFrom($script, $position, 1);
        }

        $part = new ScriptPart();
        $part
            ->setScript($script)
            ->setUser($user)
            ->setContent($content)
            ->setType($type)
            ->setPosition($position);

        $this->scriptPartRepository->save($part, true);

        return $part;
    }

    public function update(ScriptPart $part, ?string $content, ?ScriptPartType $type, ?int $position): ScriptPart
    {
        if ($content !== null) {
            $part->setContent($content);
        }

        if ($type !== null) {
            $part->setType($type);
        }

        if ($position !== null && $position !== $part->getPosition()) {
            $this->repositionWithinScript($part, $position);
        }

        $this->scriptPartRepository->save($part, true);

        return $part;
    }

    public function delete(ScriptPart $part): void
    {
        $script = $part->getScript();
        $deletedPosition = $part->getPosition();

        $this->scriptPartRepository->remove($part, true);

        if ($script !== null && $deletedPosition !== null) {
            $this->scriptPartRepository->shiftPositionsFrom($script, $deletedPosition + 1, -1);
        }
    }

    private function repositionWithinScript(ScriptPart $part, int $newPosition): void
    {
        $script = $part->getScript();
        if ($script === null) {
            return;
        }

        $oldPosition = $part->getPosition();

        if ($oldPosition === null || $oldPosition === $newPosition) {
            $part->setPosition($newPosition);
            return;
        }

        // Move the part out of the way temporarily so the shift doesn't affect it.
        $part->setPosition(-1);
        $this->scriptPartRepository->save($part, true);

        if ($newPosition < $oldPosition) {
            // Moving up: shift parts in [newPosition, oldPosition - 1] down by +1.
            $this->scriptPartRepository->shiftPositionsBetween($script, $newPosition, $oldPosition - 1, 1);
        } else {
            // Moving down: shift parts in [oldPosition + 1, newPosition] up by -1.
            $this->scriptPartRepository->shiftPositionsBetween($script, $oldPosition + 1, $newPosition, -1);
        }

        $part->setPosition($newPosition);
    }
}
