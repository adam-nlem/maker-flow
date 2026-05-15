import { useState } from "react"
import { useTranslation } from "react-i18next"
import { autoUpdate, flip, FloatingPortal, offset, shift, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { BlockPicker } from "react-color"
import { HEX_COLOR_PATTERN } from "~/utils/agencyValidation"

interface ColorFieldProps {
    label: string
    value: string
    defaultColor: string
    onChange: (hex: string) => void
}

export default function ColorField({ label, value, defaultColor, onChange }: ColorFieldProps) {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const trimmed = value.trim()
    const isValid = HEX_COLOR_PATTERN.test(trimmed)
    const swatchColor = isValid ? trimmed : defaultColor

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "bottom-start",
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })

    const dismiss = useDismiss(context)
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss])

    return (
        <div className="flex flex-col gap-2">
            <label className="text-body-xs text-muted-2 uppercase tracking-wide">{label}</label>
            <button
                ref={refs.setReference}
                type="button"
                aria-label={t("agencySettings:colorPickerAriaLabel")}
                onClick={() => setIsOpen((open) => !open)}
                {...getReferenceProps()}
                className="flex flex-row items-center gap-3 rounded-lg border border-pale-gray bg-clear px-3 py-2 hover:bg-surface-hover transition-colors"
            >
                <span
                    className="h-6 w-6 rounded-md border border-pale-gray shrink-0"
                    style={{ backgroundColor: swatchColor }}
                    aria-hidden="true"
                />
                <span className="text-body-sm text-dark font-mono">{trimmed || defaultColor}</span>
            </button>

            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        className="z-70"
                        {...getFloatingProps()}
                    >
                        <BlockPicker
                            color={isValid ? trimmed : defaultColor}
                            onChangeComplete={(color) => onChange(color.hex)}
                        />
                    </div>
                </FloatingPortal>
            )}
        </div>
    )
}
