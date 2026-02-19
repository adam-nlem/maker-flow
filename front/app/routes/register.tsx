import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useLogin } from "~/hooks/api/users/useLogin";
import { useRegister } from "~/hooks/api/users/useRegister";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useCurrentUser()
    const { login } = useLogin()

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    const { register, isPending, error } = useRegister();

    useEffect(() => {
        if (authLoading === false && user) {
            navigate("/");
        }
    }, [user, authLoading, navigate])

    const validateForm = () => {
        if (!firstName.trim()) {
            setValidationError("Le prénom est requis");
            return false;
        }
        if (!lastName.trim()) {
            setValidationError("Le nom est requis");
            return false;
        }
        if (!email.trim()) {
            setValidationError("L'email est requis");
            return false;
        }
        if (!password.trim()) {
            setValidationError("Le mot de passe est requis");
            return false;
        }
        if (!confirmPassword.trim()) {
            setValidationError("La confirmation du mot de passe est requise");
            return false;
        }
        if (password !== confirmPassword) {
            setValidationError("Les mots de passe ne correspondent pas");
            return false;
        }
        setValidationError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        await register({ firstName, lastName, email, password });
        await login({ email, password });
    }

    const errorMessage = validationError || (error?.message ?? null);


    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-dark">
                    Créer votre compte
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
                        label="Prénom"
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                    />

                    <Input
                        label="Nom"
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                    />

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

                    <Input
                        label="Mot de passe"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    <Input
                        label="Confirmer le mot de passe"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                    />

                    <div>
                        <Button
                            type="submit"
                            style="primary"
                            isLoading={isPending}
                            disabled={isPending}
                        >
                            Créer mon compte
                        </Button>
                    </div>
                </form>



                <p className="mt-10 text-center text-body-sm">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-primary">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
