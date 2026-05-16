import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useIsMac } from "~/hooks/useIsMac";

interface FocusShortcut {
  key: string;
  label: string;
}

interface SearchBarProps {
  setDebouncedSearchTerm: (debouncedSearchTerm: string) => void;
  width?: string;
  placeholder?: string;
  focusShortcut?: FocusShortcut;
}

export default function SearchBar({
  setDebouncedSearchTerm,
  width = "w-full",
  placeholder,
  focusShortcut,
}: SearchBarProps) {
  const { t } = useTranslation();
  const isMac = useIsMac();
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!focusShortcut) return;

    const handler = (e: KeyboardEvent) => {
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey;
      if (modifierPressed && e.key.toLowerCase() === focusShortcut.key.toLowerCase()) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusShortcut, isMac]);

  const resolvedPlaceholder = placeholder ?? t("searchBar.defaultPlaceholder");
  const shortcutLabel = focusShortcut
    ? isMac
      ? `⌘${focusShortcut.label}`
      : `Ctrl+${focusShortcut.label}`
    : null;


    return (
      <div className={`${width} flex items-center gap-2 rounded-lg border border-pale-gray bg-clear-2 pl-3 pr-1.5 py-1`}>
        <MagnifyingGlassIcon className="size-4 text-muted-2 shrink-0" strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          placeholder={resolvedPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none placeholder-muted-2 text-dark text-body-sm"
        />
        {shortcutLabel && (
          <span className="shrink-0 rounded-md bg-clear border border-pale-gray-2 px-1.5 py-0.5 text-body-xs text-muted-2">
            {shortcutLabel}
          </span>
        )}
      </div>
    );
  }
