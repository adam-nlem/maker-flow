// Maps each agency theme field to the CSS custom property it overrides at runtime.
// When the field is null/empty/invalid, the property is removed and the default
// declared in `app.css` (`@theme` block) applies.
export const AGENCY_THEME_CSS_VARIABLES = {
    accentColor: '--color-primary',
    backgroundColor: '--color-clear',
    backgroundSecondaryColor: '--color-light-gray',
    textColor: '--color-dark',
    textSecondaryColor: '--color-gray',
    headingFont: '--font-family-display',
    bodyFont: '--font-family-sans',
} as const

export type AgencyThemeField = keyof typeof AGENCY_THEME_CSS_VARIABLES
