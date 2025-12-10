import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { User } from "~/models/User";
import { UnauthorizedException, CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

// Define the shape of our context
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    errorMessage: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Check if user is logged in when the component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await httpClient.get('/users/me');
                setUser(User.fromJSON(res.data));
                setErrorMessage(null);
            } catch (err) {
                if (!(err instanceof UnauthorizedException)) {

                    console.error(err);
                }

            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Login function
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await httpClient.post('/login', { email, password });
            setUser(User.fromJSON(res.data));
            setErrorMessage(null);
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                setErrorMessage("Email ou mot de passe incorrect")
            } else {
                setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : String(err));
                console.error(err);
            }

        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await httpClient.get("/logout");
            setUser(null);
        } catch (err) {
            setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : String(err));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // The value that will be available to consumers of this context
    const value = {
        user,
        isLoading,
        errorMessage,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook that lets components easily access the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
