import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import RegisterForm from "~/components/auth/RegisterForm";
import { Button } from '~/components/ui/Button';
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { OtpType } from "~/models/enums/OtpType";
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore";

export default function RegisterPage() {
    const navigate = useNavigate();
    const prefillEmail = useAuthPrefillStore((s) => s.email);

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-dark">
                    Créer votre compte
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <RegisterForm
                    initialEmail={prefillEmail ?? ""}
                    formSpacing="space-y-6"
                    onRegistered={({ pendingOtpToken, email }) => {
                        navigate("/verify-otp", {
                            state: {
                                pendingOtpToken,
                                purpose: OtpType.EmailVerification,
                                email,
                            },
                        });
                    }}
                />

                <p className="mt-10 text-center text-body-sm">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-primary">
                        Se connecter
                    </Link>
                </p>

                <div className="mt-3 flex justify-center">
                    <Button style="outline" width="w-auto" height="h-8" className="text-body-xs" onClick={() => navigate('/onboarding')}>
                        Découvrir MakerFlow
                    </Button>
                </div>
            </div>
        </div>
    );
}
