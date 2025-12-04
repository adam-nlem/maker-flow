import { useState } from "react";
import type { ProjectType } from "~/models/enums/ProjectType";
import { ConflictException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

export function useCreateProject() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<ProjectType | null>(null)

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setName("")
        setDescription("")
        setType(null)
        setErrorMessage(null)
        setIsSubmitting(false)
    }

    async function createProject(): Promise<void> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            await httpClient.post('/projects/', {
                "name": name,
                "description": description,
                "type": type
            })

            resetForm()
        } catch (err) {
            let message
            if (err instanceof ConflictException) {

                message = "Vous avez déjà un Projet avec ce nom"
            } else {
                message = "Une erreur est survenue lors de la création du Projet"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name, setName,
        description, setDescription,
        type, setType,
        errorMessage, setErrorMessage,
        isSubmitting,
        createProject
    }

}