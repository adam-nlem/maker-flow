import { Input } from "~/components/ui/Input";
import { ProjectType } from "~/models/enums/ProjectType";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/Button";
import { CircularProgress } from "~/components/ui/CircularProgress";
import { TextArea } from "~/components/ui/TextArea";
import { Select } from "~/components/ui/Select";
import { StepBadge } from "~/components/ui/StepBadge";
import { CreateProjectModal } from "~/components/projects/CreateProjectModal";

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
      <CreateProjectModal />
    </div>
  );
}
