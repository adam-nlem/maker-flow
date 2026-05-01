import { LinkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import { Platform } from "~/models/enums/Platform";
import { useIntegrationLoginModalStore } from "~/stores/integrations/integrationLoginModalStore";

export default function ConnectIntegrationPlaceholder() {
    const { t } = useTranslation();
    const setSelectedPlatform = useIntegrationLoginModalStore((state) => state.setSelectedPlatform);

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <LinkIcon className="size-6 text-gray mb-2" />
            <h2 className="text-heading-md mb-1">{t("integrations:placeholder.title")}</h2>
            <p className="text-body-sm text-gray mb-3 text-center max-w-xs">
                {t("integrations:placeholder.description")}
            </p>
            <Button style="primary" width="w-fit" onClick={() => setSelectedPlatform(Platform.Instagram)}>
                {t("integrations:placeholder.action")}
            </Button>
        </div>
    );
}
