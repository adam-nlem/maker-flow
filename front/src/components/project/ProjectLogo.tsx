import { useShowProjectLogo } from "~/hooks/api/projects/useShowProjectLogo";
import Shimmer from "~/components/ui/Shimmer";

interface ProjectLogoProps {
  projectUuid?: string | null,
  projectName?: string | null,
  logoUrl?: string | null;
  className?: string;
}

export default function ProjectLogo({ projectUuid, projectName, logoUrl: logoUrlProp, className = "" }: ProjectLogoProps) {
  const controlled = logoUrlProp !== undefined;
  const { logoUrl: fetchedLogoUrl, isLoading } = useShowProjectLogo(controlled ? undefined : projectUuid ?? undefined);
  const logoUrl = controlled ? logoUrlProp : fetchedLogoUrl;

  if (!controlled && isLoading) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <Shimmer width="w-full" height="h-full" radius="rounded-md" />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className={`overflow-hidden rounded-md ${className}`}>
        <img src={logoUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (projectName) {
    return <ProjectLogoInitial name={projectName} className={className} />;
  }

  return <div className={`rounded-md bg-pale-gray-2 ${className}`} />;
}

function ProjectLogoInitial({ name, className }: { name: string; className: string }) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className={`flex items-center justify-center rounded-md bg-pale-gray-2 text-muted-2 ${className}`}>
      <span className="text-heading-sm font-semibold leading-none">{initial}</span>
    </div>
  );
}
