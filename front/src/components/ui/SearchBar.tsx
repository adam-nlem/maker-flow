import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "./Input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  setDebouncedSearchTerm: (debouncedSearchTerm: string) => void;
  width?: string;
}
export default function SearchBar({ setDebouncedSearchTerm, width = "w-full" }: SearchBarProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchTerm])

  return (
    <Input
      placeholder={t("searchBar.defaultPlaceholder")}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      icon={<MagnifyingGlassIcon className="size-4 text-gray" strokeWidth={2} />}
      width={width}
    />
  )
}
