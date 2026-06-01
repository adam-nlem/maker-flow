import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useKeyboardShortcut, type KeyboardShortcut } from "~/hooks/useKeyboardShortcut";
import { ShortcutBadge } from "./ShortcutBadge";

interface SearchBarProps {
  setDebouncedSearchTerm: (debouncedSearchTerm: string) => void;
  width?: string;
  placeholder?: string;
  focusShortcut?: KeyboardShortcut;
}

export default function SearchBar({
  setDebouncedSearchTerm,
  width = "w-full",
  placeholder,
  focusShortcut,
}: SearchBarProps) {
  const { t } = useTranslation();
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

  useKeyboardShortcut(focusShortcut, () => inputRef.current?.focus());

  const resolvedPlaceholder = placeholder ?? t("searchBar.defaultPlaceholder");

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
      {focusShortcut && <ShortcutBadge label={focusShortcut.label} />}
    </div>
  );
}
