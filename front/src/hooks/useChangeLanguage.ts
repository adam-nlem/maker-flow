import { useTranslation } from "react-i18next";
import { Language } from "~/models/enums/Language";

export function useChangeLanguage() {
    const { i18n } = useTranslation();

    const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? Language.Fr) as Language;

    const changeLanguage = (language: Language) => {
        i18n.changeLanguage(language);
        document.documentElement.lang = language;
    };

    return { currentLanguage, changeLanguage };
}
