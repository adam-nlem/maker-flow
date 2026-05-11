import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import { UserRole, invitableUserRoles, userRoleTranslationKeys } from "~/models/enums/UserRole";
import { useInviteCollaborator } from "~/hooks/api/collaborators/useInviteCollaborator";

interface InviteCollaboratorFormProps {
    onInvited: () => void;
}

export default function InviteCollaboratorForm({ onInvited }: InviteCollaboratorFormProps) {
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>(UserRole.Editor);

    const { inviteCollaborator, isPending } = useInviteCollaborator();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await inviteCollaborator({ firstName, lastName, email, role });
        setFirstName("");
        setLastName("");
        setEmail("");
        setRole(UserRole.Editor);
        onInvited();
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
                label={t("collaborators:invite.fields.firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <Input
                label={t("collaborators:invite.fields.lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <Input
                label={t("collaborators:invite.fields.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <div>
                <h3 className="text-heading-sm">{t("collaborators:invite.fields.role")}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {invitableUserRoles.map((invitableRole) => (
                        <Pill
                            key={invitableRole}
                            label={t(userRoleTranslationKeys[invitableRole])}
                            isSelected={role === invitableRole}
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
                            onClick={() => setRole(invitableRole)}
                        />
                    ))}
                </div>
            </div>

            <Button type="submit" style="primary" className="mt-2" isLoading={isPending} disabled={isPending}>
                <p className="text-sm">{t("collaborators:invite.submit")}</p>
            </Button>
        </form>
    );
}
