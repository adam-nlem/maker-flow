import { useState } from "react";
import { Input } from "~/components/ui/Input";
import { ProjectType, projectTypeOptions, projectTypeToFrenchTranslation } from "~/models/enums/ProjectType";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { ToggleChip } from "~/components/ui/ToggleChip";
import { StepBadge } from "~/components/ui/StepBadge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useCreateProject } from "~/hooks/api/projects/useCreateProject";
import ModalOverlay from "~/components/ui/ModalOverlay";

interface CreateProjectModalProps {
    showModal: boolean;
    showStepHeader?: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

export default function CreateProjectModal({ showModal, showStepHeader = false, onClose, onProjectCreated }: CreateProjectModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [types, setTypes] = useState<ProjectType[]>([]);

    const { createProject, isPending } = useCreateProject()

    const resetForm = () => {
        setName("");
        setDescription("");
        setTypes([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createProject({ name, description, types });
        resetForm();
        onProjectCreated();
    }

    if (!showModal) return null;

    return (
        <ModalOverlay isOpen={showModal} onClose={onClose}>
            <div className="border rounded-xl border-light-gray w-[500px] h-fit flex flex-col gap-3 py-5 px-10 shadow-lg bg-clear" onClick={(e) => e.stopPropagation()}>
                {showStepHeader && (
                    <div className="flex flex-row items-center gap-3">
                        <StepBadge label="Introduction" completed={true} />

                        <ChevronRightIcon className="size-4 text-gray" strokeWidth={2} />

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

                    <div>
                        <h1 className="text-heading-sm">Types</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {projectTypeOptions.map((type) => (
                                <ToggleChip
                                    key={type}
                                    label={projectTypeToFrenchTranslation[type]}
                                    isSelected={types.includes(type)}
                                    onToggle={() => setTypes(prev =>
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
                        className="mt-5"
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">Créer le projet</p>
                            <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                        </div>
                    </Button>
                </form>
            </div>
        </ModalOverlay>
    );
}