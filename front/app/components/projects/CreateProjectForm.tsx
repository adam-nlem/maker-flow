import { useState } from "react"
import { ChevronRightIcon } from "@heroicons/react/24/outline"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { TextArea } from "~/components/ui/TextArea"
import Pill from "~/components/ui/Pill"
import { ProjectType, projectTypeOptions, projectTypeToFrenchTranslation } from "~/models/enums/ProjectType"
import { useCreateProject } from "~/hooks/api/projects/useCreateProject"
import { PaymentRequiredException } from "~/services/httpClient/customHttpExceptions"

interface CreateProjectFormProps {
    onProjectCreated: (projectUuid: string) => void
    formSpacing?: string
    buttonStyle?: "primary" | "secondary"
}

export default function CreateProjectForm({ onProjectCreated, formSpacing = "space-y-4", buttonStyle }: CreateProjectFormProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [types, setTypes] = useState<ProjectType[]>([])
    const [limitError, setLimitError] = useState(false)

    const { createProject, isPending } = useCreateProject()

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        try {
            const project = await createProject({ name, description, types })
            setName("")
            setDescription("")
            setTypes([])
            setLimitError(false)
            onProjectCreated(project.uuid)
        } catch (error) {
            if (error instanceof PaymentRequiredException) {
                setLimitError(true)
            }
        }
    }

    return (
        <form className={formSpacing} onSubmit={handleSubmit}>
            <Input
                label="Nom"
                placeholder="Entrez le nom du Projet"
                id="project-name"
                name="name"
                type="text"
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <TextArea
                label="Description"
                placeholder="Écrivez une description (optionel)"
                id="project-description"
                name="description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div>
                <h3 className="text-heading-sm">Types</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {projectTypeOptions.map((type) => (
                        <Pill
                            key={type}
                            label={projectTypeToFrenchTranslation[type]}
                            isSelected={types.includes(type)}
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
                            onClick={() => setTypes(prev =>
                                prev.includes(type)
                                    ? prev.filter(t => t !== type)
                                    : [...prev, type]
                            )}
                        />
                    ))}
                </div>
            </div>

            <Button
                type="submit"
                style={buttonStyle}
                className="mt-5"
                isLoading={isPending}
                disabled={isPending}
            >
                <div className="flex flex-row justify-center items-center gap-3">
                    <p className="text-sm">Créer le projet</p>
                    <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                </div>
            </Button>

            {limitError && (
                <p className="text-body-xs text-danger text-center">
                    Vous avez atteint la limite de projets pour votre abonnement. Passez à un abonnement supérieur pour en créer davantage.
                </p>
            )}
        </form>
    )
}
