import { useEffect } from "react";
import { Agency } from "~/models/Agency";
import { AGENCY_THEME_CSS_VARIABLES } from "~/utils/agencyTheme";
import { HEX_COLOR_PATTERN } from "~/utils/agencyValidation";
import { getBrandFontCssStack } from "~/models/enums/BrandFont";

const COLOR_FIELDS = ["accentColor", "backgroundColor", "backgroundSecondaryColor", "textColor", "textSecondaryColor"] as const
const FONT_FIELDS = ["headingFont", "bodyFont"] as const

/**
 * Applies the agency white-label theme by writing CSS custom properties on <html>.
 * Any field that is null/empty/invalid leaves the corresponding variable unset so the
 * defaults declared in `app.css` (@theme block) apply.
 */
export function useApplyAgencyTheme(agency: Agency | null | undefined): void {
    const accentColor = agency?.accentColor ?? null
    const backgroundColor = agency?.backgroundColor ?? null
    const backgroundSecondaryColor = agency?.backgroundSecondaryColor ?? null
    const textColor = agency?.textColor ?? null
    const textSecondaryColor = agency?.textSecondaryColor ?? null
    const headingFont = agency?.headingFont ?? null
    const bodyFont = agency?.bodyFont ?? null

    useEffect(() => {
        const root = document.documentElement
        const colorValues: Record<typeof COLOR_FIELDS[number], string | null> = {
            accentColor,
            backgroundColor,
            backgroundSecondaryColor,
            textColor,
            textSecondaryColor,
        }
        const fontValues: Record<typeof FONT_FIELDS[number], string | null> = {
            headingFont,
            bodyFont,
        }

        for (const field of COLOR_FIELDS) {
            const value = colorValues[field]
            const variable = AGENCY_THEME_CSS_VARIABLES[field]
            if (value && HEX_COLOR_PATTERN.test(value)) {
                root.style.setProperty(variable, value)
            } else {
                root.style.removeProperty(variable)
            }
        }

        for (const field of FONT_FIELDS) {
            const cssStack = getBrandFontCssStack(fontValues[field])
            const variable = AGENCY_THEME_CSS_VARIABLES[field]
            if (cssStack) {
                root.style.setProperty(variable, cssStack)
            } else {
                root.style.removeProperty(variable)
            }
        }

        return () => {
            for (const field of [...COLOR_FIELDS, ...FONT_FIELDS] as const) {
                root.style.removeProperty(AGENCY_THEME_CSS_VARIABLES[field])
            }
        }
    }, [accentColor, backgroundColor, backgroundSecondaryColor, textColor, textSecondaryColor, headingFont, bodyFont])
}
