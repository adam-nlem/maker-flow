import { HookTemplatePlaceholder, hookTemplatePlaceholderToFrenchTranslation } from "~/models/enums/HookTemplatePlaceholder";

export interface HookPart {
    type: 'text' | 'placeholder';
    value: string;
    label: string;
}

export function parseHookPlaceholders(content: string): HookPart[] {
    const parts = content.split(/(\[[^\]]+\])/g);

    return parts
        .filter((part) => part.length > 0)
        .map((part) => {
            if (part.startsWith("[") && part.endsWith("]")) {
                const key = part.slice(1, -1) as HookTemplatePlaceholder;
                const label = hookTemplatePlaceholderToFrenchTranslation[key] ?? part;
                return { type: 'placeholder' as const, value: key, label };
            }
            return { type: 'text' as const, value: part, label: part };
        });
}

export function hasPlaceholders(content: string): boolean {
    return /\[[^\]]+\]/.test(content);
}
