import { Input } from "~/components/ui/Input";
import { ProjectType, projectTypeToFrenchTranslation } from "~/models/enums/ProjectType";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { Select } from "~/components/ui/Select";
import { StepBadge } from "~/components/ui/StepBadge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useCreateProject } from "~/hooks/projects/useCreateProject";
interface CreateProjectModalProps {
    showModal: boolean;
    showStepHeader?: boolean;
    onClose: () => void;
}

export default function CreateProjectModal({ showModal, showStepHeader = false, onClose }: CreateProjectModalProps) {
    const {
        name, setName,
        description, setDescription,
        type, setType,
        errorMessage, setErrorMessage,
        isSubmitting,
        createProject
    } = useCreateProject()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createProject();
        onClose();
    }

    if (!showModal) return null;

    return (

        <div className="border rounded-xl border-light-gray w-fit h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-white" onClick={(e) => e.stopPropagation()}>
            {showStepHeader && (
                <div className="flex flex-row items-center gap-3">
                    <StepBadge label="Introduction" completed={true} />

                    <ChevronRightIcon className="size-4 text-gray-400" strokeWidth={2} />

                    <StepBadge label="Projet" completed={false} />
                </div>
            )}
            <h1 className="text-heading-lg">
                Créez un nouveau Projet
            </h1>
            <p className="text-body-xs w-100">Les projets vous permettront de regrouper tous les modules afin de vous y retrouver plus rapidement</p>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Nom"
                    placeholder="Entrez le nom du Projet"
                    id="name"
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
                    id="description"
                    name="description"
                    fullWidth

                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Select
                    label="Type"
                    placeholder="Choisissez de quel type de projet il s'agit"
                    id="type"
                    name="type"
                    required
                    fullWidth
                    options={Object.values(ProjectType).map((type) => ({
                        value: type,
                        label: projectTypeToFrenchTranslation[type],
                    }))}
                    value={type ?? ''}
                    onChange={(e) => setType(e.target.value as ProjectType)}
                />

                <Button
                    type="submit"
                    fullWidth
                    size="sm"
                    variant="secondary"
                    className="mt-5"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                >
                    <div className="flex flex-row justify-center items-center gap-3">
                        <p className="text-sm">Créer le projet</p>
                        <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                    </div>
                </Button>
            </form>
        </div>
    )
}