import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { agencyQueryKeys } from "./agencyQueryKeys";

const ALLOWED_MIME_TYPE = "image/png";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface UploadAgencyLogoData {
    agencyUuid: string;
    file: File;
}

export function useUploadAgencyLogo() {
    const queryClient = useQueryClient();
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (data: UploadAgencyLogoData) => {
            const formData = new FormData();
            formData.append("logo", data.file);

            await httpClient.post("/agencies/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: agencyQueryKeys.logo(variables.agencyUuid) });
            track(AnalyticsEvent.AgencyLogoUpdated);
        },
    });

    const uploadLogo = async (data: UploadAgencyLogoData) => {
        if (data.file.type !== ALLOWED_MIME_TYPE) {
            setValidationErrorKey("agencySettings:validation.logoMimeType");
            return;
        }

        if (data.file.size > MAX_FILE_SIZE) {
            setValidationErrorKey("agencySettings:validation.logoTooLarge");
            return;
        }

        setValidationErrorKey(null);
        await mutation.mutateAsync(data);
    };

    const clearValidationError = () => setValidationErrorKey(null);

    return {
        uploadLogo,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
        validationErrorKey,
        clearValidationError,
    };
}
