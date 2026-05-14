import { useTranslation } from "react-i18next"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import SelectDropdown from "~/components/ui/SelectDropdown"
import { BRAND_FONT_OPTIONS, type BrandFontOption } from "~/models/enums/BrandFont"

interface FontFieldProps {
    label: string
    value: string
    defaultLabel: string
    defaultCssStack: string
    onChange: (value: string) => void
}

export default function FontField({ label, value, defaultLabel, defaultCssStack, onChange }: FontFieldProps) {
    const { t } = useTranslation()
    const selected = BRAND_FONT_OPTIONS.find((option) => option.value === value) ?? null

    return (
        <div className="flex flex-col gap-2">
            <label className="text-body-xs text-gray uppercase tracking-wide">{label}</label>
            <SelectDropdown<BrandFontOption | null>
                items={[null, ...BRAND_FONT_OPTIONS]}
                selectedItemId={selected?.value ?? "default"}
                getItemId={(item) => item?.value ?? "default"}
                onSelect={(item) => onChange(item?.value ?? "")}
                renderTrigger={({ onClick }) => (
                    <button
                        type="button"
                        onClick={onClick}
                        className="w-full flex flex-row items-center justify-between gap-3 rounded-lg border border-light-gray bg-clear px-3 py-2 hover:bg-surface-hover transition-colors"
                    >
                        <span
                            className="text-body-sm text-dark truncate"
                            style={{ fontFamily: selected?.cssStack ?? defaultCssStack }}
                        >
                            {selected?.label ?? defaultLabel}
                        </span>
                        <ChevronUpDownIcon className="size-4 text-gray shrink-0" strokeWidth={1.8} />
                    </button>
                )}
                renderItem={({ item, onSelect }) => (
                    <button
                        type="button"
                        onClick={onSelect}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-surface-hover transition-colors"
                    >
                        <span
                            className="text-body-sm text-dark"
                            style={{ fontFamily: item?.cssStack ?? defaultCssStack }}
                        >
                            {item?.label ?? t("agencySettings:fields.fontPlaceholder")}
                        </span>
                    </button>
                )}
            />
        </div>
    )
}
