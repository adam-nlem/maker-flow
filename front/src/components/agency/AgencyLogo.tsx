import { useTranslation } from "react-i18next";
import { PencilIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useShowAgencyLogo } from "~/hooks/api/agency/useShowAgencyLogo";
import { useUploadAgencyLogo } from "~/hooks/api/agency/useUploadAgencyLogo";
import { Agency } from "~/models/Agency";
import { HEX_COLOR_PATTERN } from "~/utils/agencyValidation";
import FileUpload from "~/components/ui/FileUpload";
import Shimmer from "~/components/ui/Shimmer";

interface AgencyLogoProps {
    agency: Agency;
    editable?: boolean;
    className?: string;
}

interface AgencyLogoVariantProps {
    agency: Agency;
    className: string;
}

interface AgencyLogoUploaderProps extends AgencyLogoVariantProps {
    logoUrl: string | null;
}

export default function AgencyLogo({ agency, editable = false, className = "" }: AgencyLogoProps) {
    const { logoUrl, isLoading } = useShowAgencyLogo(agency.uuid);

    if (isLoading) {
        return (
            <div className={`overflow-hidden ${className}`}>
                <Shimmer width="w-full" height="h-full" radius="rounded-md" />
            </div>
        );
    }

    if (editable) {
        return <AgencyLogoUploader agency={agency} logoUrl={logoUrl} className={className} />;
    }

    if (logoUrl) {
        return (
            <div className={`overflow-hidden rounded-md ${className}`}>
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
        );
    }

    return <AgencyLogoInitial agency={agency} className={className} />;
}

function AgencyLogoInitial({ agency, className }: AgencyLogoVariantProps) {
    const initial = agency.name.trim().charAt(0).toUpperCase();
    const hasAccentColor = !!agency.accentColor && HEX_COLOR_PATTERN.test(agency.accentColor);

    return (
        <div
            className={`flex items-center justify-center rounded-md ${hasAccentColor ? "text-clear" : "bg-light-gray text-gray"} ${className}`}
            style={hasAccentColor ? { backgroundColor: agency.accentColor ?? undefined } : undefined}
        >
            <span className="text-heading-sm font-semibold leading-none">{initial}</span>
        </div>
    );
}

function AgencyLogoUploader({ agency, logoUrl, className }: AgencyLogoUploaderProps) {
    const { t } = useTranslation();
    const { uploadLogo, isPending, validationErrorKey } = useUploadAgencyLogo();

    return (
        <FileUpload
            accept="image/png"
            icon={PhotoIcon}
            hint={t("agencySettings:logo.hint")}
            errorMessage={validationErrorKey ? t(validationErrorKey) : null}
            isPending={isPending}
            onFileSelected={(file) => uploadLogo({ agencyUuid: agency.uuid, file })}
            className={className}
        >
            {logoUrl
                ? ({ isDragActive }) => (
                    <div className="relative w-full h-full overflow-hidden rounded-md">
                        <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 flex items-center justify-center bg-light-gray/50 transition-opacity ${isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                            <PencilIcon className="size-5 text-dark" strokeWidth={1.8} />
                        </div>
                    </div>
                )
                : undefined}
        </FileUpload>
    );
}
