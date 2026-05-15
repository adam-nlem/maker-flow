import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveErrorMessage } from "~/services/apiErrorHandler/errorCodeMessages";
import { SettingsSection, settingsSectionTranslationKeys } from "~/models/enums/SettingsSection";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import PasswordRules from "~/components/ui/PasswordRules";
import LanguageSwitcher from "~/components/settings/LanguageSwitcher";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useUpdateUser } from "~/hooks/api/users/useUpdateUser";
import { useLogout } from "~/hooks/api/users/useLogout";
import { getPasswordRules, isPasswordValid } from "~/utils/passwordValidation";

export default function GeneralSettings() {
    const { t } = useTranslation();
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

    const errorMessage = error ? resolveErrorMessage(error) : null;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (hasPasswordChanges && (!currentPassword || !newPassword || !confirmNewPassword)) {
            setValidationError(t("settings:general.validation.passwordFieldsRequired"));
            return;
        }
        if (newPassword && !isPasswordValid(newPassword)) {
            setValidationError(t("settings:general.validation.passwordCriteriaUnmet"));
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
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-pale-gray">
                <h2 className="text-heading-xl">{t(settingsSectionTranslationKeys[SettingsSection.General])}</h2>
            </div>

            <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
                <div className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-6 py-4 md:py-5">
                    <div className="flex flex-col gap-5">
                        <h3 className="text-heading-sm">{t("settings:general.account")}</h3>
                        <Input
                            label={t("settings:general.fields.firstName")}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <Input
                            label={t("settings:general.fields.lastName")}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                        <Input
                            label={t("settings:general.fields.email")}
                            value={user.email}
                            readOnly
                            className="text-muted-2 cursor-not-allowed"
                        />

                        <h3 className="text-heading-sm mt-5">{t("settings:general.preferences")}</h3>
                        <LanguageSwitcher />

                        <h3 className="text-heading-sm mt-5">{t("settings:general.password")}</h3>
                        <Input
                            label={t("settings:general.fields.currentPassword")}
                            type="password"
                            value={currentPassword}
                            onChange={(e) => { setCurrentPassword(e.target.value); setValidationError(null); reset(); }}
                            autoComplete="current-password"
                        />
                        <Input
                            label={t("settings:general.fields.newPassword")}
                            type="password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setValidationError(null); reset(); }}
                            autoComplete="new-password"
                        />
                        {newPassword.length > 0 && (
                            <PasswordRules rules={getPasswordRules(newPassword)} />
                        )}
                        <Input
                            label={t("settings:general.fields.confirmPassword")}
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => { setConfirmNewPassword(e.target.value); setValidationError(null); reset(); }}
                            autoComplete="new-password"
                        />
                        {(validationError ?? errorMessage) && (
                            <p className="text-body-sm text-danger">{validationError ?? errorMessage}</p>
                        )}

                        <h3 className="text-heading-sm">{t("settings:general.session")}</h3>
                        <Button type="button" style="danger" onClick={logout} isLoading={isLoggingOut} disabled={isLoggingOut} width="w-auto">
                            <p className="text-sm">{t("settings:general.logout")}</p>
                        </Button>
                    </div>
                </div>

                {hasChanges && (
                    <div className="px-4 md:px-6 py-3 md:py-4 border-t border-pale-gray">
                        <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                            <p className="text-sm">{t("actions.save")}</p>
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
