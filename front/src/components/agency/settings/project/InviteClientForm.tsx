import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { useInviteClient } from "~/hooks/api/projectClients/useInviteClient";
import { ArrowRightIcon, EnvelopeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import type { Invitation } from "~/models/Invitation";

interface InviteClientFormProps {
  projectUuid: string;
  onInvited: (invitation: Invitation) => void;
  onValuesChange?: (values: { firstName: string; lastName: string; email: string }) => void;
}

export default function InviteClientForm({ projectUuid, onInvited, onValuesChange }: InviteClientFormProps) {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const { inviteClient, isPending } = useInviteClient();

  const updateValues = (values: { firstName: string; lastName: string; email: string }) => {
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setEmail(values.email);
    onValuesChange?.(values);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invitation = await inviteClient({ projectUuid, firstName, lastName, email });
    updateValues({ firstName: "", lastName: "", email: "" });
    onInvited(invitation);
  };

  return (
    <form className="space-y-3 w-full" onSubmit={handleSubmit}>
      <Input
        label={t("clients:invite.fields.firstName")}
        value={firstName}
        className="size-12"
        icon={<UserCircleIcon className="size-4 text-muted-2" />}
        onChange={(e) => updateValues({ firstName: e.target.value, lastName, email })}
        required
      />
      <Input
        label={t("clients:invite.fields.lastName")}
        value={lastName}
        className="size-12"
        icon={<UserCircleIcon className="size-4 text-muted-2" />}
        onChange={(e) => updateValues({ firstName, lastName: e.target.value, email })}
        required
      />
      <Input
        label={t("clients:invite.fields.email")}
        type="email"
        value={email}
        className="size-12"
        icon={<EnvelopeIcon className="size-4 text-muted-2" />}
        onChange={(e) => updateValues({ firstName, lastName, email: e.target.value })}
        required
      />

      <Button
        type="submit"
        style="primary"
        className="mt-5"
        width="w-fit"
        height="h-11"
        isLoading={isPending}
        disabled={isPending}
      >
        <p className="text-sm">{t("clients:invite.submit")}</p>
        <ArrowRightIcon className="size-4" />
      </Button>
    </form>
  );
}
