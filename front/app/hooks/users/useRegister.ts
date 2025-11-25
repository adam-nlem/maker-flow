import { useState } from "react";
import { User } from "~/models/user";
import { ConflictException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";


export function useRegister() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setFirstName("")
        setLastName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setErrorMessage(null)
        setIsSubmitting(false)
    }

    function validateForm() {
        if (!firstName.trim()) {
            setErrorMessage("Le prénom est requis")
            return false
        }

        if (!lastName.trim()) {
            setErrorMessage("Le nom est requis")
            return false
        }

        if (!email.trim()) {
            setErrorMessage("L'email est requis")
            return false
        }

        if (!password.trim()) {
            setErrorMessage("Le mot de passe est requis")
            return false
        }

        if (!confirmPassword.trim()) {
            setErrorMessage("La confirmation du mot de passe est requise")
            return false
        }

        if (password !== confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas")
            return false
        }

        return true
    }

    async function register(): Promise<void> {
        if (!validateForm()) {
            return
        }

        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            await httpClient.post('/users/register', {
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "password": password
            })

            resetForm()
        } catch (err) {
            let message
            if (err instanceof ConflictException) {
                message = "Un utilisateur avec cet email existe déjà"
            } else {
                message = "Une erreur est survenue lors de la création du compte"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
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
        setErrorMessage,
        isSubmitting,
        register
    }
}
