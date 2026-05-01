import { useState } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";

import type { Script } from "~/models/Script";
import type { ScriptPart } from "~/models/ScriptPart";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { ScriptPartSuggestionStatus } from "~/models/enums/ScriptPartSuggestionStatus";

import { useReorderScriptParts } from "~/hooks/api/scripts/useReorderScriptParts";
import { useCreateScriptPart } from "~/hooks/api/scripts/useCreateScriptPart";
import { useListScriptPartSuggestions } from "~/hooks/api/scriptPartSuggestions/useListScriptPartSuggestions";
import { useGroupedScriptPartSuggestions } from "~/hooks/useGroupedScriptPartSuggestions";
import { useSyncedLocalParts } from "~/hooks/useSyncedLocalParts";

import ScriptPartRow from "./ScriptPartRow";
import ScriptPartDiffBlock from "./ScriptPartDiffBlock";
import { InteractiveAwarePointerSensor } from "./InteractiveAwarePointerSensor";
import { Button } from "~/components/ui/Button";

interface ScriptPartsListProps {
  parts: ScriptPart[];
  script: Script;
  isReadOnly?: boolean;
}

export default function ScriptPartsList({ parts, script, isReadOnly }: ScriptPartsListProps) {
  const { t } = useTranslation();
  const scriptUuid = script.uuid;

  const [activePart, setActivePart] = useState<ScriptPart | null>(null);
  const [localParts, setLocalParts] = useSyncedLocalParts(parts, activePart !== null);

  const { reorderScriptParts } = useReorderScriptParts();
  const { createScriptPart, isPending: isCreating } = useCreateScriptPart();
  const { suggestions } = useListScriptPartSuggestions({
    scriptUuid,
    status: ScriptPartSuggestionStatus.Pending,
  });
  const { suggestionsByPart, insertSuggestionsByPosition } = useGroupedScriptPartSuggestions(suggestions);

  const sensors = useSensors(
    useSensor(InteractiveAwarePointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActivePart(localParts.find((p) => p.uuid === event.active.id) ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePart(null);
    if (isReadOnly || !over || active.id === over.id) return;

    const oldIndex = localParts.findIndex((p) => p.uuid === active.id);
    const newIndex = localParts.findIndex((p) => p.uuid === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...localParts];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    setLocalParts(reordered);

    await reorderScriptParts({
      scriptUuid,
      orderedParts: reordered.map((p) => ({ uuid: p.uuid, type: p.type })),
    });
  };

  const handleAddPart = () => {
    if (isReadOnly) return;
    createScriptPart({
      scriptUuid,
      content: "",
      type: ScriptPartType.Text,
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-dot-pattern">
      <div className="flex-1 overflow-y-auto px-6 py-4 h-full scrollbar-none">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-3 min-h-8">
            {insertSuggestionsByPosition.get(0)?.map((s) => (
              <ScriptPartDiffBlock key={s.uuid} suggestion={s} scriptUuid={scriptUuid} />
            ))}
            {localParts.map((part) => (
              <div key={part.uuid} className="flex flex-col gap-3">
                <ScriptPartRow part={part} scriptUuid={scriptUuid} isReadOnly={isReadOnly} />
                {suggestionsByPart.get(part.uuid)?.map((s) => (
                  <ScriptPartDiffBlock key={s.uuid} suggestion={s} scriptUuid={scriptUuid} />
                ))}
                {insertSuggestionsByPosition.get(part.position + 1)?.map((s) => (
                  <ScriptPartDiffBlock key={s.uuid} suggestion={s} scriptUuid={scriptUuid} />
                ))}
              </div>
            ))}
          </div>

          {!isReadOnly && localParts.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray py-8">
              <p className="text-body-sm text-center">{t("scripts:parts.emptyTitle")}</p>
              <p className="text-body-sm text-center">{t("scripts:parts.emptyHint")}</p>
            </div>
          )}

          <DragOverlay>
            {activePart && (
              <div className="opacity-90 rotate-1 shadow-lg">
                <ScriptPartRow part={activePart} scriptUuid={scriptUuid} isDragDisabled />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {!isReadOnly && (
        <div className="min-h-0 px-6 py-4 border-t border-light-gray bg-clear">
          <Button onClick={handleAddPart} isLoading={isCreating}>{t("scripts:parts.addPart")}</Button>
        </div>
      )}
    </div>
  );
}
