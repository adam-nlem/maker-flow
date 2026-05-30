import { useTranslation } from "react-i18next";
import { EnvelopeIcon, GlobeAltIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { Agency } from "~/models/Agency";
import FileUpload from "~/components/ui/FileUpload";
import { useState, useEffect } from "react";
import { useUpdateAgency } from "~/hooks/api/agency/useUpdateAgency";

interface AgencySettingsFormProps {
  agency: Agency;
}

export default function AgencySettingsForm({ agency }: AgencySettingsFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(agency.name ?? "");
  const [contactEmail, setContactEmail] = useState(agency.contactEmail ?? "");
  const [website, setWebsite] = useState(agency.website ?? "");
  const [logo, setLogo] = useState<File | undefined>(undefined)

  const { updateAgency, isPending, validationErrorKey } = useUpdateAgency();

  useEffect(() => {
    setName(agency.name ?? "");
    setContactEmail(agency.contactEmail ?? "");
    setWebsite(agency.website ?? "");
  }, [agency]);

  const hasChanges =
    name !== (agency.name ?? "") ||
    contactEmail !== (agency.contactEmail ?? "") ||
    website !== (agency.website ?? "");

  const submit = async () => {
    await updateAgency({
      agencyUuid: agency.uuid,
      name,
      contactEmail,
      website,
      logo
    });
  };


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="w-full mx-auto bg-clear overflow-hidden">
        <div className="px-6 pt-6">
          <FileUpload
            accept="image/png"
            icon={PhotoIcon}
            hint={t("onboarding:createAgency.logo.hint")}
            errorMessage={validationErrorKey ? t(validationErrorKey) : null}
            isPending={isPending}
            onFileSelected={(file, _) => setLogo(file)}
            className="h-50"
          />
        </div>

        <div className="px-7 pt-4 pb-6 flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-body-xs text-muted-2 uppercase tracking-wide">{t("agencySettings:sections.identity")}</h3>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              simple
              required
              textStyle="text-heading-md"
              placeholder={t("agencySettings:fields.namePlaceholder")}
            />

            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              simple
              textStyle="text-body-sm"
              icon={<EnvelopeIcon className="size-4 text-dark" strokeWidth={1.8} />}
              placeholder={t("agencySettings:fields.contactEmailPlaceholder")}
            />

            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              simple
              textStyle="text-body-sm"
              icon={<GlobeAltIcon className="size-4 text-dark" strokeWidth={1.8} />}
              placeholder={t("agencySettings:fields.websitePlaceholder")}
            />
          </section>

          {validationErrorKey && (
            <p className="text-sm text-danger">{t(validationErrorKey)}</p>
          )}

          {hasChanges && (
            <div className="flex justify-end">
              <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                <p className="text-sm">{t("actions.save")}</p>
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
