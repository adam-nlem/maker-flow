import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Route } from "./+types/home";
import CreateProjectModal from "~/components/projects/CreateProjectModal";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full pt-10 flex justify-center items-center">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setShowModal(true)}
      >
        <div className="flex flex-row justify-center items-center gap-3">
          <p className="text-sm">Créer un nouveau projet</p>
          <ChevronRightIcon className="size-4 text-clear" strokeWidth={2} />
        </div>
      </Button>

      <CreateProjectModal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
