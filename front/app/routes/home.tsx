import { Input } from "~/components/ui/Input";
import { ProjectType } from "~/models/enums/ProjectType";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/Button";
import { CircularProgress } from "~/components/ui/CircularProgress";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({ loaderData }: Route.ComponentProps) {

  return (
    <div className="w-full pt-10 flex justify-center items-center">
      <div className="border rounded-xl border-gray-400 flex flex-col gap-3 py-5 px-10 shadow-lg">
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center gap-1">
            <div className="rounded-full bg-primary h-min  p-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-clear">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-heading-xs ">Introduction</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-gray">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>

          <div className="flex flex-row items-center gap-1">
            <CircularProgress size={20} />

            <p className="text-heading-xs ">Projet</p>
          </div>
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
          className="w-100"
        />

        <label htmlFor="description" className="block text-heading-sm">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          // ref={textareaRef}
          placeholder="Écrivez une description (optionel)"
          // value={description}
          // onChange={(e) => setDescription(e.target.value)}
          // disabled={isSubmitting}
          className="block rounded-xl border border-gray-400 bg-clear px-3 py-1.5 text-body-sm text-black
              placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none 
              focus:ring-1 focus:ring-primary w-100"
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="block text-heading-sm">
            Type
          </label>
          <select
            id="type"
            name="type"
            // value={selectedType}
            // onChange={(e) => setSelectedType(e.target.value)}
            required
            className="block rounded-xl border border-gray-400 bg-clear px-3 py-1.5 text-body-sm text-black
              shadow-sm focus:border-primary focus:outline-none 
              focus:ring-1 focus:ring-primary w-100 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
          >
            <option value="" disabled selected className="text-gray">
              Choisissez de quel type de projet il s'agit
            </option>
            {Object.values(ProjectType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          fullWidth
          size="sm"
          variant="secondary"
          className="mt-5"
        >
          <div className="flex flex-row justify-center items-center gap-3">

            <p className="text-sm">Créer le projet</p>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-clear">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Button>
      </div>
    </div>
  );
}
