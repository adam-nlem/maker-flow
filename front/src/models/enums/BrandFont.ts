// Curated whitelist of Google Fonts an agency can pick for its heading/body
// typography. Enum value is the Google Fonts family name and also the
// payload value stored on `Agency.headingFont` / `Agency.bodyFont`.
export enum BrandFont {
    Inter = 'Inter',
    Roboto = 'Roboto',
    OpenSans = 'Open Sans',
    Lato = 'Lato',
    Montserrat = 'Montserrat',
    Poppins = 'Poppins',
    Outfit = 'Outfit',
    Nunito = 'Nunito',
}

export interface BrandFontOption {
    value: BrandFont
    label: string
    cssStack: string
}

const SANS_FALLBACK = "ui-sans-serif, system-ui, sans-serif"

export const BRAND_FONT_OPTIONS: BrandFontOption[] = [
    { value: BrandFont.Inter, label: 'Inter', cssStack: `Inter, ${SANS_FALLBACK}` },
    { value: BrandFont.Roboto, label: 'Roboto', cssStack: `Roboto, ${SANS_FALLBACK}` },
    { value: BrandFont.OpenSans, label: 'Open Sans', cssStack: `'Open Sans', ${SANS_FALLBACK}` },
    { value: BrandFont.Lato, label: 'Lato', cssStack: `Lato, ${SANS_FALLBACK}` },
    { value: BrandFont.Montserrat, label: 'Montserrat', cssStack: `Montserrat, ${SANS_FALLBACK}` },
    { value: BrandFont.Poppins, label: 'Poppins', cssStack: `Poppins, ${SANS_FALLBACK}` },
    { value: BrandFont.Outfit, label: 'Outfit', cssStack: `Outfit, ${SANS_FALLBACK}` },
    { value: BrandFont.Nunito, label: 'Nunito', cssStack: `Nunito, ${SANS_FALLBACK}` },
]

const VALID_BRAND_FONTS: Set<string> = new Set(BRAND_FONT_OPTIONS.map((o) => o.value))

export function isBrandFont(value: string | null | undefined): value is BrandFont {
    return value !== null && value !== undefined && VALID_BRAND_FONTS.has(value)
}

export function getBrandFontCssStack(value: string | null | undefined): string | null {
    if (!isBrandFont(value)) return null
    return BRAND_FONT_OPTIONS.find((o) => o.value === value)?.cssStack ?? null
}
