import { useEffect, useState } from "react";
import { UnprocessableEntityException } from "~/services/httpClient/customHttpExceptions";
import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import PasswordRules from "~/components/ui/PasswordRules";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useUpdateUser } from "~/hooks/api/users/useUpdateUser";
import { useLogout } from "~/hooks/api/users/useLogout";
import { getPasswordRules, isPasswordValid } from "~/utils/passwordValidation";

export default function GeneralSettings() {
    const { user } = useCurrentUser();

    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const { updateUser, isPending, error, reset } = useUpdateUser();
    const { logout, isPending: isLoggingOut } = useLogout();

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName ?? '');
            setLastName(user.lastName ?? '');
        }
    }, [user]);

    if (!user) return null;

    const hasProfileChanges = firstName !== (user.firstName ?? '') || lastName !== (user.lastName ?? '');
    const hasPasswordChanges = currentPassword.length > 0 || newPassword.length > 0 || confirmNewPassword.length > 0;
    const hasChanges = hasProfileChanges || hasPasswordChanges;

    const errorMessage = error instanceof UnprocessableEntityException
        ? (error.data?.message ?? 'An error occurred.')
        : error ? 'An error occurred.'
        : null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (hasPasswordChanges && (!currentPassword || !newPassword || !confirmNewPassword)) {
            setValidationError('Veuillez remplir tous les champs de mots de passe');
            return;
        }
        if (newPassword && !isPasswordValid(newPassword)) {
            setValidationError('Le mot de passe ne respecte pas les critères de sécurité');
            return;
        }
        const data: Parameters<typeof updateUser>[0] = { firstName, lastName };
        if (newPassword) {
            data.currentPassword = currentPassword;
            data.newPassword = newPassword;
            data.confirmNewPassword = confirmNewPassword;
        }
        try {
            await updateUser(data);
            if (newPassword) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            }
        } catch {
            // error is surfaced via mutation.error state
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-light-gray">
                <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.General]}</h2>
            </div>

            <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
                <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-5">
                    <div className="flex flex-col gap-5">
                        <h3 className="text-heading-sm">Mon compte</h3>
                        <Input
                            label="Prénom"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            fullWidth
                            required
                        />
                        <Input
                            label="Nom"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            fullWidth
                            required
                        />
                        <Input
                            label="Email"
                            value={user.email}
                            readOnly
                            fullWidth
                            className="text-gray cursor-not-allowed"
                        />

                        <h3 className="text-heading-sm mt-5">Changer de mot de passe</h3>
                        <Input
                            label="Mot de passe actuel"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => { setCurrentPassword(e.target.value); setValidationError(null); reset(); }}
                            autoComplete="current-password"
                            fullWidth
                        />
                        <Input
                            label="Nouveau mot de passe"
                            type="password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setValidationError(null); reset(); }}
                            autoComplete="new-password"
                            fullWidth
                        />
                        {newPassword.length > 0 && (
                            <PasswordRules rules={getPasswordRules(newPassword)} />
                        )}
                        <Input
                            label="Confirmer le mot de passe"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => { setConfirmNewPassword(e.target.value); setValidationError(null); reset(); }}
                            autoComplete="new-password"
                            fullWidth
                        />
                        {(validationError ?? errorMessage) && (
                            <p className="text-body-sm text-danger">{validationError ?? errorMessage}</p>
                        )}

                        <h3 className="text-heading-sm">Session</h3>
                        <Button type="button" style="danger" onClick={logout} isLoading={isLoggingOut} disabled={isLoggingOut} width="w-auto">
                            <p className="text-sm">Se déconnecter</p>
                        </Button>
                    </div>
                </div>

                {hasChanges && (
                    <div className="px-6 py-4 border-t border-light-gray">
                        <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                            <p className="text-sm">Enregistrer</p>
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
