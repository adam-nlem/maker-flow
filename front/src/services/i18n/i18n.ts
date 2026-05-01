import i18next, { type Resource, type ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { Language } from "~/models/enums/Language";

export const LANGUAGE_STORAGE_KEY = "makerflow-language";

const modules = import.meta.glob<Record<string, unknown>>(
    "./locales/*/*.json",
    { eager: true, import: "default" },
);

const resources: Resource = {};
const namespaces = new Set<string>();

for (const [path, content] of Object.entries(modules)) {
    const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (!match) continue;
    const [, namespace, language] = match;

    namespaces.add(namespace);
    resources[language] ??= {} as ResourceLanguage;
    (resources[language] as ResourceLanguage)[namespace] = content;
}

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: [Language.Fr, Language.En],
        fallbackLng: Language.En,
        load: "languageOnly",
        defaultNS: "common",
        ns: Array.from(namespaces),
        detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            caches: ["localStorage"],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
