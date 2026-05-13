declare module "react-color" {
    import type { ComponentType } from "react";

    export interface ColorResult {
        hex: string;
        hsl: { h: number; s: number; l: number; a?: number };
        rgb: { r: number; g: number; b: number; a?: number };
    }

    export interface BlockPickerProps {
        color?: string;
        colors?: string[];
        triangle?: "top" | "hide";
        width?: string;
        onChange?: (color: ColorResult) => void;
        onChangeComplete?: (color: ColorResult) => void;
        className?: string;
    }

    export const BlockPicker: ComponentType<BlockPickerProps>;
}
