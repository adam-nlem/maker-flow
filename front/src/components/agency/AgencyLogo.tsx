import { useShowAgencyLogo } from "~/hooks/api/agency/useShowAgencyLogo";
import { Agency } from "~/models/Agency";
import Shimmer from "~/components/ui/Shimmer";

interface AgencyLogoProps {
  agency?: Agency;
  logoUrl?: string | null;
  className?: string;
}

export default function AgencyLogo({ agency, logoUrl: logoUrlProp, className = "" }: AgencyLogoProps) {
  const controlled = logoUrlProp !== undefined;
  const { logoUrl: fetchedLogoUrl, isLoading } = useShowAgencyLogo(controlled ? undefined : agency?.uuid);
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

  if (agency) {
    return <AgencyLogoInitial agency={agency} className={className} />;
  }

  return <div className={`rounded-md bg-pale-gray-2 ${className}`} />;
}

function AgencyLogoInitial({ agency, className }: { agency: Agency; className: string }) {
  const initial = agency.name.trim().charAt(0).toUpperCase();

  return (
    <div className={`flex items-center justify-center rounded-md bg-pale-gray-2 text-muted-2 ${className}`}>
      <span className="text-heading-sm font-semibold leading-none">{initial}</span>
    </div>
  );
}
