import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { useAuth } from "~/context/AuthContext";
import { useRegister } from "~/hooks/users/useRegister";

export default function Register() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        errorMessage,
        isSubmitting,
        register
    } = useRegister();

    const { login } = useAuth();

    useEffect(() => {
        if (authLoading === false && user) {
            navigate("/");
        }
    }, [user, authLoading, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register();
        await login(email, password);
    }


    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Créer votre compte
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {errorMessage && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
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
                            fullWidth
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Créer mon compte
                        </Button>
                    </div>
                </form>



                <p className="mt-10 text-center text-body-sm text-gray-500 dark:text-gray-400">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-primary">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
