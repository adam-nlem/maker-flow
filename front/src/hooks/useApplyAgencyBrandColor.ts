import { useEffect } from "react";
import { HEX_COLOR_PATTERN } from "~/utils/agencyValidation";

const PRIMARY_COLOR_VARIABLE = "--color-primary";

export function useApplyAgencyBrandColor(brandColor: string | null | undefined): void {
    useEffect(() => {
        const root = document.documentElement;
        if (brandColor && HEX_COLOR_PATTERN.test(brandColor)) {
            root.style.setProperty(PRIMARY_COLOR_VARIABLE, brandColor);
        } else {
            root.style.removeProperty(PRIMARY_COLOR_VARIABLE);
        }

        return () => {
            root.style.removeProperty(PRIMARY_COLOR_VARIABLE);
        };
    }, [brandColor]);
}
