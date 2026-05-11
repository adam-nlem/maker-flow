import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { useInviteClient } from "~/hooks/api/projectClients/useInviteClient";

interface InviteClientFormProps {
    projectUuid: string;
    onInvited: () => void;
}

export default function InviteClientForm({ projectUuid, onInvited }: InviteClientFormProps) {
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const { inviteClient, isPending } = useInviteClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await inviteClient({ projectUuid, firstName, lastName, email });
        setFirstName("");
        setLastName("");
        setEmail("");
        onInvited();
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
                label={t("clients:invite.fields.firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <Input
                label={t("clients:invite.fields.lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <Input
                label={t("clients:invite.fields.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <Button type="submit" style="primary" className="mt-2" isLoading={isPending} disabled={isPending}>
                <p className="text-sm">{t("clients:invite.submit")}</p>
            </Button>
        </form>
    );
}
