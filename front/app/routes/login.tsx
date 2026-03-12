import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useLogin } from "~/hooks/api/users/useLogin";
import { OtpType } from "~/models/enums/OtpType";
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore";

export default function LoginPage() {
    const prefillEmail = useAuthPrefillStore((s) => s.email);
    const setStoredEmail = useAuthPrefillStore((s) => s.setEmail);

    const [email, setEmail] = useState<string>(prefillEmail ?? "");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const { login, isPending, error } = useLogin()

    const errorMessage = error?.message ?? null

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setStoredEmail(email);
        const response = await login({ email, password });
        if (response.requiresOtp) {
            navigate("/verify-otp", {
                state: {
                    pendingOtpToken: response.pendingOtpToken,
                    purpose: OtpType.Login,
                    email,
                },
            });
        } else if (response.requiresEmailVerification) {
            navigate("/verify-otp", {
                state: {
                    pendingOtpToken: response.pendingOtpToken,
                    purpose: OtpType.EmailVerification,
                    email: response.email,
                },
            });
        }
    }


    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-dark">
                    Connexion à votre compte
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {errorMessage && (
                    <div className="mb-4 rounded-md bg-danger/10 p-4">
                        <div className="flex">
                            <div className="text-body-sm text-danger">{errorMessage}</div>
                        </div>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Adresse email"
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />

                    <div>
                        <div className="flex items-center justify-between">
                            <Input
                                label="Mot de passe"
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                            />
                        </div>
                        {/* <div className="mt-2 text-right">
                            <Link to="/forgot-password" className="text-heading-sm text-primary-600 hover:text-primary-500">
                                Mot de passe oublié ?
                            </Link>
                        </div> */}
                    </div>

                    <div>
                        <Button
                            type="submit"
                            style="primary"
                            isLoading={isPending}
                            disabled={isPending}
                        >
                            Connexion
                        </Button>
                    </div>
                </form>



                <p className="mt-10 text-center text-body-sm">
                    Vous n'avez pas de compte ?{' '}
                    <Link to="/register" className="font-semibold leading-6 text-primary">
                        Créer un compte
                    </Link>
                </p>

                <div className="mt-3 flex justify-center">
                    <Button style="secondary" width="w-auto" height="h-8" className="text-body-xs" onClick={() => navigate('/onboarding')}>
                        Découvrir MakerFlow
                    </Button>
                </div>
            </div>
        </div>
    );
}