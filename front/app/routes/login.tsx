import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { useAuth } from "~/context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const { user, login, errorMessage, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading === false && user) {
            navigate("/");
        }
    }, [user])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
    }


    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Connexion à votre compte
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {errorMessage && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="text-body-sm text-red-700">{errorMessage}</div>
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
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Connexion
                        </Button>
                    </div>
                </form>



                <p className="mt-10 text-center text-body-sm text-gray-500 dark:text-gray-400">
                    Vous n'avez pas de compte ?{' '}
                    <Link to="/register" className="font-semibold leading-6 text-primary">
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
}