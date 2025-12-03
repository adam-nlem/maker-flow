import { Input } from "~/components/ui/Input";
import { ProjectType } from "~/models/enums/ProjectType";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { Select } from "~/components/ui/Select";
import { StepBadge } from "~/components/ui/StepBadge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export const CreateProjectModal = () => {
    return (
        <div className="border rounded-xl border-light-gray flex flex-col gap-3 py-5 px-10 shadow-lg">
            <div className="flex flex-row items-center gap-3">
                <StepBadge label="Introduction" completed={true} />

                <ChevronRightIcon className="size-4 text-gray-400" strokeWidth={2} />

                <StepBadge label="Projet" completed={false} />
            </div>
            <h1 className="text-heading-lg">
                Créez votre premier Projet
            </h1>
            <p className="text-body-xs w-100">Les projets vous permettront de regrouper tous les modules afin de vous y retrouver plus rapidement</p>

            <Input
                label="Nom"
                placeholder="Entrez le nom du Projet"
                id="name"
                name="name"
                type="text"
                required
                // value={email}
                // onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />
            
            <TextArea
                label="Description"
                placeholder="Écrivez une description (optionel)"
                id="description"
                name="description"
                fullWidth

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
                    label: type,
                }))}
            />

            <Button
                type="submit"
                fullWidth
                size="sm"
                variant="secondary"
                className="mt-5"
            >
                <div className="flex flex-row justify-center items-center gap-3">
                    <p className="text-sm">Créer le projet</p>
                    <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
                </div>
            </Button>
        </div>
    )
}