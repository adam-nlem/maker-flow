import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { ToggleChip } from "~/components/ui/ToggleChip";
import { SidePanel } from "~/components/ui/SidePanel";
import type { HookTemplate } from "~/models/HookTemplate";
import type { Script } from "~/models/Script";
import { HookTemplateCategory, hookTemplateCategoryOptions, hookTemplateCategoryToFrenchTranslation } from "~/models/enums/HookTemplateCategory";
import { useListPaginatedHookTemplates } from "~/hooks/api/hookTemplates/useListPaginatedHookTemplates";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import HookTemplateCard from "./HookTemplateCard";
import CreateHookTemplateModal from "./CreateHookTemplateModal";

interface HookTemplatePanelProps {
    scripts: Script[];
    focusedScript: Script;
    onApplyTemplate: (template: HookTemplate) => void;
}

export default function HookTemplatePanel({ scripts, focusedScript, onApplyTemplate }: HookTemplatePanelProps) {
    const [activeCategory, setActiveCategory] = useState<HookTemplateCategory>(HookTemplateCategory.All);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.HookTemplates);
    const closePanel = useScriptRightPanelStore((s) => s.closePanel);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearchTerm(searchInput);
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchInput]);

    const { hookTemplates, hasMore, isLoadingMore, listMore } = useListPaginatedHookTemplates({ searchTerm: debouncedSearchTerm || undefined });
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore();
                }
            },
            { rootMargin: "0px 0px 200px 0px" },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore, listMore]);

    const recentTemplateUuids = new Set(
        scripts
            .filter((s) => s.hookTemplate !== undefined)
            .map((s) => s.hookTemplate!.uuid)
    );

    const filteredTemplates = hookTemplates.filter((template) => {
        switch (activeCategory) {
            case HookTemplateCategory.Public:
                return template.isPublic;
            case HookTemplateCategory.Private:
                return !template.isPublic;
            case HookTemplateCategory.Recent:
                return recentTemplateUuids.has(template.uuid);
            case HookTemplateCategory.All:
            default:
                return true;
        }
    });

    return (
        <>
            <SidePanel
                title="Hooks"
                isOpen={isOpen}
                onClose={closePanel}
                headerActions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-gray hover:text-dark transition-colors cursor-pointer"
                    >
                        <PlusIcon className="size-4" strokeWidth={2} />
                    </button>
                }
                toolbar={
                    <>
                        <div className="px-4 py-3 border-b border-light-gray">
                            <Input
                                simple
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Rechercher..."
                                textStyle="text-body-sm"
                                icon={<MagnifyingGlassIcon className="size-4 text-gray" strokeWidth={2} />}
                                fullWidth
                            />
                        </div>
                        <div className="flex flex-row flex-wrap gap-2 px-4 py-3 border-b border-light-gray">
                            {hookTemplateCategoryOptions.map((category) => (
                                <ToggleChip
                                    key={category}
                                    label={hookTemplateCategoryToFrenchTranslation[category]}
                                    isSelected={activeCategory === category}
                                    onToggle={() => setActiveCategory(category)}
                                />
                            ))}
                        </div>
                    </>
                }
            >
                <div className="p-3 flex flex-col gap-2">
                    {filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray">
                            <p className="text-body-sm text-center">Aucun template.</p>
                        </div>
                    ) : (
                        <>
                            {filteredTemplates.map((template) => (
                                <HookTemplateCard
                                    key={template.uuid}
                                    template={template}
                                    isSelected={focusedScript.hookTemplate?.uuid === template.uuid}
                                    onClick={() => onApplyTemplate(template)}
                                />
                            ))}
                            <div ref={sentinelRef} className="h-1" />
                        </>
                    )}
                </div>
            </SidePanel>

            <CreateHookTemplateModal showModal={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </>
    );
}
