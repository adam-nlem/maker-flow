import { useShowAgencyLogo } from "~/hooks/api/agency/useShowAgencyLogo";
import { Agency } from "~/models/Agency";
import Shimmer from "~/components/ui/Shimmer";

interface AgencyLogoProps {
  agencyUuid?: string | null,
  agencyName?: string | null,
  logoUrl?: string | null;
  className?: string;
}

export default function AgencyLogo({ agencyUuid, agencyName, logoUrl: logoUrlProp, className = "" }: AgencyLogoProps) {
  const controlled = logoUrlProp !== undefined;
  const { logoUrl: fetchedLogoUrl, isLoading } = useShowAgencyLogo(controlled ? undefined : agencyUuid!);
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

  if (agencyName) {
    return <AgencyLogoInitial name={agencyName} className={className} />;
  }

  return <div className={`rounded-md bg-pale-gray-2 ${className}`} />;
}

function AgencyLogoInitial({ name, className }: { name: string; className: string }) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className={`flex items-center justify-center rounded-md bg-pale-gray-2 text-muted-2 ${className}`}>
      <span className="text-heading-sm font-semibold leading-none">{initial}</span>
    </div>
  );
}
