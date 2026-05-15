import { LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "~/hooks/useChangeLanguage";
import { languageOptions, languageToLabel } from "~/models/enums/Language";
import SelectDropdown from "../ui/SelectDropdown";
import Pill from "../ui/Pill";

export default function LanguageSwitcher() {
    const { t } = useTranslation();
    const { currentLanguage, changeLanguage } = useChangeLanguage();

    return (
        <div className="flex flex-col gap-2">
            <label className="text-body-sm text-muted-2">{t("language.label")}</label>
            <SelectDropdown
                items={languageOptions}
                selectedItemId={currentLanguage}
                getItemId={(l) => l}
                onSelect={(item) => changeLanguage(item)}
                renderTrigger={({ onClick }) => (
                    <Pill
                        onClick={onClick}
                        isSelected
                        icon={LanguageIcon}
                        label={languageToLabel[currentLanguage]}
                    />)
                }
                renderItem={({ item, isSelected, onSelect }) => {
                    return !isSelected ? <Pill
                        isSelected
                        icon={LanguageIcon}
                        label={languageToLabel[item]}
                        onClick={onSelect}
                    /> : null
                }}
            />
        </div>
    );
}
