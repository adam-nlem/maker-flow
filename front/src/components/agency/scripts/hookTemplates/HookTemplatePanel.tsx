import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/Input";
import { ToggleChip } from "~/components/ui/ToggleChip";
import { SidePanel } from "~/components/ui/SidePanel";
import { HookTemplateCategory, hookTemplateCategoryOptions, hookTemplateCategoryTranslationKeys } from "~/models/enums/HookTemplateCategory";
import { useListPaginatedHookTemplates } from "~/hooks/api/hookTemplates/useListPaginatedHookTemplates";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { useHookTemplateStore } from "~/stores/scripts/hookTemplateStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import HookTemplateCard from "./HookTemplateCard";
import CreateHookTemplateModal from "./CreateHookTemplateModal";

export default function HookTemplatePanel() {
    const { t } = useTranslation();
    const focusedHookTemplateUuid = useHookTemplateStore((s) => s.focusedHookTemplateUuid);
    const setSelectedTemplate = useHookTemplateStore((s) => s.setSelectedTemplate);
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore);

    const filteredTemplates = hookTemplates.filter((template) => {
        switch (activeCategory) {
            case HookTemplateCategory.Public:
                return template.isPublic;
            case HookTemplateCategory.Private:
                return !template.isPublic;
            case HookTemplateCategory.All:
            default:
                return true;
        }
    });

    return (
        <>
            <SidePanel
                title={t("scripts:hooks.panelTitle")}
                isOpen={isOpen}
                onClose={closePanel}
                bodyRef={scrollContainerRef}
                headerActions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-muted-2 hover:text-dark transition-colors cursor-pointer"
                    >
                        <PlusIcon className="size-4" strokeWidth={2} />
                    </button>
                }
                toolbar={
                    <>
                        <div className="px-4 py-3 border-b border-pale-gray">
                            <Input
                                simple
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={t("scripts:hooks.searchPlaceholder")}
                                textStyle="text-body-sm"
                                icon={<MagnifyingGlassIcon className="size-4 text-muted-2" strokeWidth={2} />}
                            />
                        </div>
                        <div className="flex flex-row flex-wrap gap-2 px-4 py-3 border-b border-pale-gray">
                            {hookTemplateCategoryOptions.map((category) => (
                                <ToggleChip
                                    key={category}
                                    label={t(hookTemplateCategoryTranslationKeys[category])}
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
                        <div className="flex flex-col items-center justify-center py-12 text-muted-2">
                            <p className="text-body-sm text-center">{t("scripts:hooks.empty")}</p>
                        </div>
                    ) : (
                        <>
                            {filteredTemplates.map((template) => (
                                <HookTemplateCard
                                    key={template.uuid}
                                    template={template}
                                    isSelected={focusedHookTemplateUuid === template.uuid}
                                    onClick={() => setSelectedTemplate(template)}
                                />
                            ))}
                        </>
                    )}
                </div>
            </SidePanel>

            <CreateHookTemplateModal showModal={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </>
    );
}
