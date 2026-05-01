import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { Language } from "~/models/enums/Language";

import commonFr from "./locales/common/fr.json";
import commonEn from "./locales/common/en.json";
import navigationFr from "./locales/navigation/fr.json";
import navigationEn from "./locales/navigation/en.json";
import errorsFr from "./locales/errors/fr.json";
import errorsEn from "./locales/errors/en.json";
import settingsFr from "./locales/settings/fr.json";
import settingsEn from "./locales/settings/en.json";
import sidebarFr from "./locales/sidebar/fr.json";
import sidebarEn from "./locales/sidebar/en.json";
import authFr from "./locales/auth/fr.json";
import authEn from "./locales/auth/en.json";
import onboardingFr from "./locales/onboarding/fr.json";
import onboardingEn from "./locales/onboarding/en.json";
import welcomeFr from "./locales/welcome/fr.json";
import welcomeEn from "./locales/welcome/en.json";
import prelaunchFr from "./locales/prelaunch/fr.json";
import prelaunchEn from "./locales/prelaunch/en.json";
import projectsFr from "./locales/projects/fr.json";
import projectsEn from "./locales/projects/en.json";
import tasksFr from "./locales/tasks/fr.json";
import tasksEn from "./locales/tasks/en.json";
import contentsFr from "./locales/contents/fr.json";
import contentsEn from "./locales/contents/en.json";
import homeFr from "./locales/home/fr.json";
import homeEn from "./locales/home/en.json";
import scriptsFr from "./locales/scripts/fr.json";
import scriptsEn from "./locales/scripts/en.json";
import integrationsFr from "./locales/integrations/fr.json";
import integrationsEn from "./locales/integrations/en.json";
import enumsFr from "./locales/enums/fr.json";
import enumsEn from "./locales/enums/en.json";

export const LANGUAGE_STORAGE_KEY = "makerflow-language";

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            [Language.Fr]: {
                common: commonFr,
                navigation: navigationFr,
                errors: errorsFr,
                settings: settingsFr,
                sidebar: sidebarFr,
                auth: authFr,
                onboarding: onboardingFr,
                welcome: welcomeFr,
                prelaunch: prelaunchFr,
                projects: projectsFr,
                tasks: tasksFr,
                contents: contentsFr,
                home: homeFr,
                scripts: scriptsFr,
                integrations: integrationsFr,
                enums: enumsFr,
            },
            [Language.En]: {
                common: commonEn,
                navigation: navigationEn,
                errors: errorsEn,
                settings: settingsEn,
                sidebar: sidebarEn,
                auth: authEn,
                onboarding: onboardingEn,
                welcome: welcomeEn,
                prelaunch: prelaunchEn,
                projects: projectsEn,
                tasks: tasksEn,
                contents: contentsEn,
                home: homeEn,
                scripts: scriptsEn,
                integrations: integrationsEn,
                enums: enumsEn,
            },
        },
        supportedLngs: [Language.Fr, Language.En],
        fallbackLng: Language.Fr,
        defaultNS: "common",
        ns: ["common", "navigation", "errors", "settings", "sidebar", "auth", "onboarding", "welcome", "prelaunch", "projects", "tasks", "contents", "home", "scripts", "integrations", "enums"],
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
