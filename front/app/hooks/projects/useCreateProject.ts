import { useState } from "react";
import type { ProjectType } from "~/models/enums/ProjectType";
import { Project } from "~/models/Project";
import { ConflictException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

export function useCreateProject() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [types, setTypes] = useState<ProjectType[]>([])

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setName("")
        setDescription("")
        setTypes([])
        setErrorMessage(null)
        setIsSubmitting(false)
    }

    async function createProject(): Promise<Project | undefined> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            const res = await httpClient.post('/projects', {
                "name": name,
                "description": description,
                "types": types
            })

            resetForm()
            return Project.fromJSON(res.data)
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
        types, setTypes,
        errorMessage, setErrorMessage,
        isSubmitting,
        createProject
    }

}